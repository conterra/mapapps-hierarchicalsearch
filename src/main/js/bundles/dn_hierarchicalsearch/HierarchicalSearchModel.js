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
        let properties = this._properties;
        this.fields = properties.fields.map((field) => {
            field.value = null;
            field.selected = false;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });
        let envs = componentContext.getBundleContext().getCurrentExecutionEnvironment();
        this.isMobile = envs.some((env) => env.name === "Mobile");
        this._setUpSelect(this.fields, 0);
    },

    _setUpSelect(fields, index) {
        if (fields.length > index) {
            let field = fields[index];
            field.disabled = false;
            field.loading = true;
            let name = field.name;
            let results = [];
            let queryTask = new QueryTask(this._store.target);
            let query = new Query();
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
            // reset fields after the current selected
            fields.forEach((f, i) => {
                if (i >= index && index !== 0) {
                    f.items = [];
                    f.value = null;
                }
                if (i >= index + 1) {
                    f.disabled = true;
                }
            });
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
        let store = this._store;
        let query = this._getComplexQuery();
        if (query) {
            this.loading = true;
            this._queryResults(store, query);
        }
        if (this.isMobile) {
            this._tool.set("active", false);
        }
    },

    _queryResults(store, query) {
        let filter = new Filter(store, query, {});
        return filter.query({}, {fields: {geometry: 1}}).then((results) => {
            this.loading = false;
            if (results.length) {
                this.resultActions.forEach(action => {
                    action.executeAction(results, store, filter)
                });
                let result = results[0];
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
        let query = {};
        if (!query["$or"]) {
            query["$or"] = [];
        }
        let searchObject = this._getSearchObject();
        query["$or"].push(searchObject);
        return query;
    },

    _getSearchObject() {
        let searchObj = {};
        this.fields.forEach((field) => {
            searchObj[field.name] = field.value;
        });
        return searchObj;
    }
});
