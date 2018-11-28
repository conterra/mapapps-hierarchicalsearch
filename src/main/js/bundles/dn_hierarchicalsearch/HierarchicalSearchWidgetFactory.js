/*
 * Copyright (C) 2018 con terra GmbH (info@conterra.de)
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
import HierarchicalSearchWidget from "./HierarchicalSearchWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import QueryTask from "esri/tasks/QueryTask";
import Query from "esri/tasks/support/Query";
import Filter from "ct/store/Filter";

export default class HierarchicalSearchWidgetFactory {

    activate(componentContext) {
        this._initComponent(componentContext);
    }

    _initComponent(componentContext) {
        let properties = this._properties;
        let envs = componentContext.getBundleContext().getCurrentExecutionEnvironment();
        this.isMobile = envs.some((env) => {
            return env.name === "Mobile"
        });

        const vm = this.vm = new Vue(HierarchicalSearchWidget);
        vm.fields = properties.fields.map((field) => {
            field.value = null;
            field.selected = false;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });

        this._setUpSelect(vm.fields, 0);

        vm.$on('selected', (field, index) => {
            let nextIndex = index + 1;
            if (vm.fields.length > nextIndex) {
                this._setUpSelect(vm.fields, index + 1);
            }
            else if (vm.fields.length === nextIndex) {
                this._search();
            }
        });
    }

    createInstance() {
        return VueDijit(this.vm);
    }

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
    }

    _search() {
        let store = this._store;
        let query = this._getComplexQuery();
        if (query) {
            this.vm.loading = true;
            this._queryResults(store, query);
        }
        if (this.isMobile) {
            this._tool.set("active", false);
        }
    }

    _queryResults(store, query) {
        let filter = new Filter(store, query, {});
        return filter.query({}, {fields: {geometry: 1}}).then((results) => {
            this.vm.loading = false;
            this.vm.parcelSelected = false;
            if (results.length) {
                if (results.length === 1) {
                    let id = results[0][store.idProperty];
                    this._openPopupService.openPopup(id, {
                        store: store
                    });
                }
                this._dataModel.setDatasource(filter);
                let geometry = results[0].geometry;
                if (geometry) {
                    this._eventService.postEvent("dn_hierarchicalsearch/RESULT", {
                        "geometry": geometry
                    });
                }
            } else {
                this._logService.warn({
                    id: 0,
                    message: this.i18n.noResultsError
                });
            }
        }, (error) => {
            this._logService.error({
                id: error.code,
                message: error
            });
            this.vm.parcelSelected = false;
            this.vm.loading = false;
        });
    }

    _getComplexQuery() {
        let query = {};
        if (!query["$or"]) {
            query["$or"] = [];
        }
        let searchObject = this._getSearchObject();
        query["$or"].push(searchObject);
        return query;
    }

    _getSearchObject() {
        let searchObj = {};
        this.vm.fields.forEach((field) => {
            searchObj[field.name] = field.value;
        });
        return searchObj;
    }
}
