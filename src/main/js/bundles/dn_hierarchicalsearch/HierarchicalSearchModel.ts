/*
 * Copyright (C) 2022 con terra GmbH (info@conterra.de)
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
import * as query from "esri/rest/query";
import Query from "esri/rest/support/Query";
import Filter from "ct/store/Filter";
import ComplexQueryToSQL from "ct/store/ComplexQueryToSQL";

export default declare({

    fields: [],
    loading: false,
    resultActions: [],
    isMobile: false,

    activate(componentContext) {
        const envs = componentContext.getBundleContext().getCurrentExecutionEnvironment();
        this.isMobile = envs.some((env) => env.name === "Mobile");
        this._initComponent();
    },

    addResultAction(resultAction, properties) {
        if (this._properties.resultHandling.indexOf(properties.id) > -1) {
            this.resultActions.push(resultAction);
        }
    },

    _initComponent() {
        const properties = this._properties;
        this.fields = properties.fields.map((field) => {
            field.value = null;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });
        this._setUpSelect(0);
    },

    search() {
        this._queryResults();
        if (this.isMobile) {
            this._tool.set("active", false);
        }
    },

    selectChanged(field, index) {
        const fields = this.fields;
        const nextIndex = index + 1;
        if (!field.value) {
            this._resetSelects(index);
        } else if (fields.length > nextIndex) {
            this._setUpSelect(index + 1);
        } else if (fields.length === nextIndex) {
            this.search();
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
            this._queryDistinctValues(field, index);
        }
    },

    _queryDistinctValues(field, index) {
        const queryUrl = this._store.target;
        if(!queryUrl) {
            console.error("Store has no target!");
            return;
        }
        const fieldName = field.name;
        const queryObject = new Query({
            outFields: [fieldName],
            orderByFields: [fieldName],
            returnDistinctValues: true,
            returnGeometry: false
        });
        if (index === 0) {
            queryObject.where = "1=1";
        } else {
            const complexQuery = this._getComplexQuery();
            queryObject.where = ComplexQueryToSQL.toSQLWhere(complexQuery, {});
        }
        query.executeQueryJSON(this._store.target, queryObject).then(function (response) {
            response.features.forEach((feature) => {
                field.items.push(feature.attributes[fieldName]);
            });
            field.loading = false;
        });
    },

    _queryResults() {
        const props = this._properties;

        this.loading = true;
        const store = this._store;
        const query = this._getComplexQuery();
        const filter = new Filter(store, query, {});
        return filter.query({}, {fields: {geometry: 1}}).then((results) => {
            this.loading = false;
            if (results.length) {
                const result = results[0];

                const mapActions = props.mapActions
                const mapActionsConfig = props.mapActionsConfig;
                mapActionsConfig.items = results;
                mapActionsConfig.source = store;

                this._actionService.trigger(mapActions, mapActionsConfig);

                // Execute non-map-action actions
                this.resultActions.forEach(action => {
                    action.executeAction(store, query);
                });

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
