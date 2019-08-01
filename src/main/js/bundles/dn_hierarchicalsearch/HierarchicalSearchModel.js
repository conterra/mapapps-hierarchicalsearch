/*
 * Copyright (C) 2019 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {declare} from "apprt-core/Mutable";
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";
import Filter from "ct/store/Filter";

export default declare({

    fields: [],
    loading: false,
    resultActions: [],
    isMobile: false,

    activate(componentContext) {
        this._initComponent(componentContext);
    },

    addResultAction(resultAction, properties) {
        if (this._properties.resultHandling.indexOf(properties.id) > -1) {
            this.resultActions.push(resultAction);
        }
    },

    _initComponent(componentContext) {
        const properties = this._properties;
        this.fields = properties.fields.map((field) => {
            field.value = null;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });
        const envs = componentContext.getBundleContext().getCurrentExecutionEnvironment();
        this.isMobile = envs.some((env) => env.name === "Mobile");
        this._setUpSelect(0);
    },

    selectChanged(field, index) {
        const fields = this.fields;
        const nextIndex = index + 1;
        if (!field.value) {
            this._resetSelects(index);
        } else if (fields.length > nextIndex) {
            this._setUpSelect(index + 1);
        } else if (fields.length === nextIndex) {
            this._search();
        }
    },

    _resetSelects(index) {
        const fields = this.fields;
        // reset fields after the current changed
        fields.forEach((f, i) => {
            if (i > index) {
                f.items = [];
                f.value = null;
                f.disabled = true;
            }
        });
    },

    _setUpSelect(index) {
        const fields = this.fields;
        if (fields.length > index) {
            const field = fields[index];
            field.disabled = false;
            field.loading = true;
            const name = field.name;
            const results = [];
            const queryTask = new QueryTask(this._store.target);
            const query = new Query();
            if (index === 0) {
                query.where = "1=1";
            } else {
                let f = fields[0];
                query.where = f.name + "='" + f.value + "'";
                for (let i = 1; i < index; i++) {
                    if (f.value === null) {
                        return; //fix
                    }
                    f = fields[i];
                    query.where = query.where + " AND " + f.name + "='" + f.value + "'";
                }
            }
            query.outFields = [name];
            query.orderByFields = [name];
            query.returnDistinctValues = true;
            query.returnGeometry = false;
            queryTask.execute(query).then(response => {
                response.features.forEach((feature) => {
                    results.push(feature.attributes[name]);
                });
                field.items = results;
                field.loading = false;
            });
        }
    },

    _search() {
        const store = this._store;
        const query = this._getComplexQuery();
        if (query) {
            this.loading = true;
            this._queryResults(store, query);
        }
        if (this.isMobile) {
            this._tool.set("active", false);
        }
    },

    _queryResults(store, query) {
        const filter = new Filter(store, query, {});
        return filter.query({}, {fields: {geometry: 1}}).then((results) => {
            this.loading = false;
            if (results.length) {
                this.resultActions.forEach(action => {
                    action.executeAction(results, store, filter)
                });
                const result = results[0];
                if (result) {
                    this._eventService.postEvent("dn_hierarchicalsearch/RESULT", {
                        "result": result
                    });
                }
            } else {
                this._logService.warn({
                    id: 0,
                    message: this._i18n.get().noResultsError
                });
            }
        }, (error) => {
            this._logService.error({
                id: error.code,
                message: error
            });
            this.loading = false;
        });
    },

    _getComplexQuery() {
        const query = {};
        if (!query["$or"]) {
            query["$or"] = [];
        }
        const searchObject = this._getSearchObject();
        query["$or"].push(searchObject);
        return query;
    },

    _getSearchObject() {
        const searchObj = {};
        this.fields.forEach((field) => {
            if (field && field.value) {
                searchObj[field.name] = field.value;
            }
        });
        return searchObj;
    }
});
