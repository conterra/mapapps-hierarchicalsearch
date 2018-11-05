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
        let firstField = this.firstField = properties.fields[0].fieldName;
        let secField = this.secField = properties.fields[1].fieldName;
        let thirdField;
        const vm = this.vm = new Vue(HierarchicalSearchWidget);
        vm.subdistrictLabel = properties.fields[0].label;
        vm.fieldLabel = properties.fields[1].label;

        if (properties.fields.length > 2) {
            thirdField = this.thirdField = properties.fields[2].fieldName;
            vm.threeSelects = true;
            vm.parcelLabel = properties.fields[2].label;
        }

        this.setUpFirstDropDownMenu(this.firstField);

        vm.$on('subdistrictSelected', () => {
            if (vm.parcelData !== undefined) {
                vm.parcelData = undefined;
                vm.parcel = [];
                vm.fieldSelected = true;
            }
            // noinspection JSAnnotator
            if (vm.fieldData !== undefined && vm.subdistrictSelected === false) {
                vm.subdistrictSelected = true;
                vm.fieldData = undefined;
                vm.field = [];

            } else {
                vm.fieldData = undefined;
                this.setUpCascadingDropDownMenus(firstField, secField, this.vm.subdistrictData, 'field', 'subdistrictSelected')
            }
        });

        vm.$on('fieldSelected', () => {
            if (!vm.parcelSelected) {
                vm.parcelData = undefined;
                vm.parcel = [];
                vm.fieldSelected = true;
            }
            if (vm.fieldData !== undefined) {
                if (vm.threeSelects) {
                    vm.parcelData = undefined;
                    this.setUpCascadingDropDownMenus(secField, thirdField, this.vm.fieldData, 'parcel', 'fieldSelected')
                } else if (vm.subdistrictSelected === false) {
                    this._search(secField, undefined, this.vm.fieldData, undefined, vm.threeSelects)
                }
            }
        });

        vm.$on('parcelSelected', () => {
            if (vm.parcelData !== undefined) {
                this._search();
            }
        });
    }

    createInstance() {
        return VueDijit(this.vm);
    }

    setUpFirstDropDownMenu(firstFieldID) {
        let results = [];
        let queryTask = new QueryTask(this._store.target);
        let query = new Query();
        query.where = "1=1";
        query.outFields = [firstFieldID];
        query.orderByFields = [firstFieldID];
        query.returnDistinctValues = true;
        query.returnGeometry = false;
        queryTask.execute(query)
            .then(response => {
                response.features.forEach(feature => {
                    results.push(feature.attributes[firstFieldID]);
                }, (firstFieldID));
                this.vm.subdistrict = results;
            }, this);
    }

    setUpCascadingDropDownMenus(basedOn, fieldID, value, select, nextField) {
        let results = [];
        let queryTask = new QueryTask(this._store.target);
        let query = new Query();
        query.where = basedOn + "= '" + value + "'";
        query.outFields = [fieldID];
        query.orderByFields = [fieldID];
        query.returnDistinctValues = true;
        query.returnGeometry = false;
        if (!this.vm.subdistrictSelected) {
            query.where = query.where + " AND " + this.firstField + "= '" + this.vm.subdistrictData + "'";
        }
        queryTask.execute(query)
            .then(response => {
                response.features.forEach(feature => {
                    results.push(feature.attributes[fieldID]);
                }, (fieldID));
                this.vm[select] = results;
                this.vm[nextField] = false;
            }, this);
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
                message: e
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
        this.searchObjects = [];
        this.searchObjects.push(searchObject);
        query["$or"].push(searchObject);
        return query;
    }

    _getSearchObject() {
        let selectedParcelName = this.vm.subdistrictData;
        let selectedParcelNumber = this.vm.fieldData;
        let selectedParcel2Number = this.vm.parcelData;
        let parcelNameAttribute = this.firstField;
        let parcelNumberAttribute = this.secField;
        let parcel2NumberAttribute = this.thirdField;

        let searchObj = {};
        searchObj[parcelNameAttribute] = selectedParcelName;
        searchObj[parcelNumberAttribute] = selectedParcelNumber;
        if (parcel2NumberAttribute && selectedParcel2Number) {
            searchObj[parcel2NumberAttribute] = selectedParcel2Number;
        }
        return searchObj;
    }
}
