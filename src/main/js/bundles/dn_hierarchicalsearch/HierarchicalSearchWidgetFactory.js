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
import VueDijit from "apprt-vue/VueDijit";
import Vue from "apprt-vue/Vue";
import Binding from "apprt-binding/Binding";
import HierarchicalSearchWidget from "./HierarchicalSearchWidget.vue";

export default class HierarchicalSearchWidgetFactory {

    activate() {
        this._initComponent();
    }

    _initComponent() {
        const vm = this.vm = new Vue(HierarchicalSearchWidget);
        const model = this._hierarchicalSearchModel;

        vm.i18n = this._i18n.get().ui;

        vm.$on("search", () => {
            model._search();
        });
        vm.$on('selected', (field, index) => {
            model.selectChanged(field, index);
        });

        Binding.for(vm, model)
            .syncAll("fields", "loading")
            .enable()
            .syncToLeftNow();
    }

    createInstance() {
        return VueDijit(this.vm);
    }
}
