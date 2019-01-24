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

export default class HierarchicalSearchVueWidgetFactory {

    activate(componentContext) {
        this._initComponent(componentContext);

    }

    _initComponent(componentContext) {
        let properties = this._properties;
        let envs = componentContext.getBundleContext().getCurrentExecutionEnvironment();
     /**   this.isMobile = envs.some((env) => {
            return env.name === "Mobile"
        });**/

        const vm = this.vm = new Vue(HierarchicalSearchWidget);
        vm.fields = properties.fields.map((field) => {
            field.value = null;
            field.selected = false;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });
    }

    createInstance() {
        return this.vm;
    }
}
