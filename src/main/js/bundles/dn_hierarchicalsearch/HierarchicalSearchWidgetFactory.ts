///
/// Copyright (C) 2022 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import VueDijit from "apprt-vue/VueDijit";
import Vue from "apprt-vue/Vue";
import Binding from "apprt-binding/Binding";
import HierarchicalSearchWidget from "./HierarchicalSearchWidget.vue";
import HierarchicalSearchModel from "./HierarchicalSearchModel";

import type HierarchicalSearchController from "./HierarchicalSearchController";

export default class HierarchicalSearchWidgetFactory {

    private vm: Vue;
    private _i18n: any;
    private hierarchicalSearchModel: typeof HierarchicalSearchModel;
    private hierarchicalSearchController: HierarchicalSearchController;

    activate(componentContext: any): void {
        this._initComponent(componentContext);
    }

    _initComponent(componentContext: any): void {
        const model = this.hierarchicalSearchModel;
        const controller = this.hierarchicalSearchController;

        const envs = componentContext.getBundleContext().getCurrentExecutionEnvironment();
        model.isMobile = envs.some((env) => env.name === "Mobile");

        model.fields = controller.getFields(model.fields);
        controller._setUpSelect(0);

        const vm = this.vm = new Vue(HierarchicalSearchWidget);
        vm.i18n = this._i18n.get().ui;

        vm.$on("search", () => {
            controller.search();
        });
        vm.$on('selected', (field: object, index: number) => {
            controller.selectChanged(field, index);
        });

        Binding.for(vm, model)
            .syncAll("fields", "loading")
            .enable()
            .syncToLeftNow();
    }

    createInstance(): typeof VueDijit {
        return VueDijit(this.vm);
    }
}
