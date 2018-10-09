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
import HierarchicalsearchWidget from "./HierarchicalsearchWidget.vue";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Query from "esri/tasks/support/Query";
import ct_when from "ct/_when";
import Filter from "ct/store/Filter";
import ServiceResolver from "apprt/ServiceResolver";

//import Binding from "apprt-binding/Binding";

class HierarchicalsearchWidgetFactory {

    activate(componentContext) {
        this._initComponent(componentContext);


    }

    _initComponent(componentContext) {
        let properties = this.properties = this._properties;
        let mapModel = this.mapModel = this._mapWidgetModel;
        let dataModel = this.dataModel = this._dataModel;
        let searchLayer = this.searchLayer = undefined;
        let firstField = this.firstField = properties.fields[0].id;
        let secField = this.secField = properties.fields[1].id;
        let thirdField;
        let serviceResolver = this.serviceResolver = new ServiceResolver();
        let bundleCtx = componentContext.getBundleContext();
        serviceResolver.setBundleCtx(bundleCtx);
        const vm = this.hierarchicalsearchWidget = new Vue(HierarchicalsearchWidget);
        vm.subdistrictLabel=properties.fields[0].label;
        vm.fieldLabel=properties.fields[1].label;

        if(properties.fields.length >2){
            thirdField = this.thirdField = properties.fields[2].id;
            vm.threeSelects = true;
            vm.parcelLabel=properties.fields[2].label;
        }

        vm.$on('close', () => {
            this._tool.set("active", false);

        });
        vm.$on('subdistrictSelected', () => {
            if (!vm.fieldSelected) {
                if (!vm.parcelSelected) {
                    vm.fieldSelected = true;
                    vm.parcelData = null;
                    vm.parcel = [];

                }
                vm.fieldData = undefined;
                vm.field = [];
                vm.subdistrictSelected = true;
            } else {
                this.setUpCascadingDropDownMenus(this.searchLayer, firstField, secField, this.hierarchicalsearchWidget.subdistrictData, 'field', 'subdistrictSelected')
            }


        });
        vm.$on('fieldSelected', () => {
            if (!vm.parcelSelected) {
                vm.parcelData = undefined;
                vm.parcel = [];
                vm.fieldSelected = true;
            }
            if (vm.fieldData != undefined) {
                if (vm.threeSelects) {
                    vm.parcelData = undefined;
                    this.setUpCascadingDropDownMenus(this.searchLayer, secField, thirdField, this.hierarchicalsearchWidget.fieldData, 'parcel', 'fieldSelected')
                } else {
                    this._getParcel(this.searchLayer, secField, undefined, this.hierarchicalsearchWidget.fieldData, undefined, vm.threeSelects)
                }
            }
        });
        vm.$on('parcelSelected', () => {
            if (vm.parcelData != undefined) {
                this._getParcel(this.searchLayer, secField, thirdField, this.hierarchicalsearchWidget.fieldData, this.hierarchicalsearchWidget.parcelData, vm.threeSelects);
            }
        });

        this.waitForLayers()

    }

    initialize() {
        let vm = this.hierarchicalsearchWidget;
        vm.loading=false;
        let layerID = this.properties.layerID;
        this.mapModel.map.layers.items.forEach(layer => {
            if (layer.id === layerID) {
                this.searchLayer = layer;
            }
        });
        this._tool.set("active", true);
        this.setUpFirstDropDownMenu(this.searchLayer, this.firstField);
    }

    createInstance() {
        return VueDijit(this.hierarchicalsearchWidget);
    }


    setUpFirstDropDownMenu(searchLayer, firstFieldID) {
        let subdistrict = [];
        let query = searchLayer.createQuery();
        query.outFields = [firstFieldID];
        query.returnDistinctValues = true;
        query.returnGeometry = false;
        searchLayer.queryFeatures(query)
            .then(response => {
                response.features.forEach(feature => {
                    subdistrict.push(feature.attributes[firstFieldID]);
                }, (firstFieldID));
                this.hierarchicalsearchWidget.subdistrict = subdistrict;
            }, this);
    };

    setUpCascadingDropDownMenus(searchLayer, basedOn, fieldID, value, select, nextField) {
        let selectedValues = [];
        let query = searchLayer.createQuery();
        query.where = basedOn + "=" + value;
        query.outFields = [fieldID];
        query.returnDistinctValues = true;
        query.returnGeometry = false;
        if (!this.hierarchicalsearchWidget.subdistrictSelected) {
            query.where = query.where + " AND " + this.firstField + "=" + this.hierarchicalsearchWidget.subdistrictData;
        }
        searchLayer.queryFeatures(query)
            .then(response => {
                response.features.forEach(feature => {
                    selectedValues.push(feature.attributes[fieldID]);
                }, (fieldID));
                this.hierarchicalsearchWidget[select] = selectedValues;
                this.hierarchicalsearchWidget[nextField] = false;
            }, this);
    };

    _getParcel(searchLayer, basedOn1, basedOn2, value1, value2, threeSelects) {
        let selectedGeometry;
        let query = searchLayer.createQuery();
        if(threeSelects){
            query.where = this.firstField + "=" + this.hierarchicalsearchWidget.subdistrictData + " AND " + basedOn1 + "=" + value1 + " AND " + basedOn2 + "=" + value2;
        } else {
            query.where = this.firstField + "=" + this.hierarchicalsearchWidget.subdistrictData + " AND " + basedOn1 + "=" + value1;

        }
        query.outFields = ['*'];
        query.returnDistinctValues = true;
        query.returnGeometry = true;
        searchLayer.queryFeatures(query)
            .then(response => {
                selectedGeometry = response.features[0];
                this._zoomToGeometry(selectedGeometry);
                this.hierarchicalsearchWidget.parcelSelected = false;
            }, this);

    };

    _zoomToGeometry(selectedGeometry) {
        this.mapModel.view.extent = selectedGeometry.geometry.extent;
        this.mapModel.view.popup.open({
            features: [selectedGeometry],
            updateLocationEnabled: true
        });
    }

    waitForLayers() {
        let map = this._mapWidgetModel.get("map");
        let layers = map.get("layers");
        layers.forEach((layer) => {
            if (layer.loaded === false) {
                layer.when((layer) => {
                    this.initialize();
                }, (error) => {
                    this.initialize();
                });
            }
        });
    }
}

module.exports = HierarchicalsearchWidgetFactory;
