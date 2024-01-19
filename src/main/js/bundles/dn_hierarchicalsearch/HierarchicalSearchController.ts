///
/// Copyright (C) 2023 con terra GmbH (info@conterra.de)
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
import type { InjectedReference } from "apprt-core/InjectedReference";
import ServiceResolver from "apprt/ServiceResolver";
import ct_util from "ct/ui/desktop/util";
import Filter from "ct/store/Filter";
import ComplexQueryToSQL from "ct/store/ComplexQueryToSQL";
import Query from "esri/rest/support/Query";
import * as query from "esri/rest/query";
import { Field } from "./Interfaces";
import HierarchicalSearchModel from "./HierarchicalSearchModel";
import HierarchicalSearchWidget from "./HierarchicalSearchWidget.vue";

export default class HierarchicalSearchController {

    private _i18n!: InjectedReference<any>;
    private _logService!: InjectedReference<any>;
    private _actionService!: InjectedReference<any>;
    private bundleContext!: InjectedReference<any>;
    private serviceResolver!: InjectedReference<any>;
    private widgetServiceRegistration!: InjectedReference<any>;
    private _resultViewerService: InjectedReference<any>;
    private _hierarchicalSearchModel: typeof HierarchicalSearchModel;
    private store: any;
    private mapActions: any;
    private mapActionsConfig: any;
    private widget: any;
    private dataTableTitle:any;

    activate(componentContext: InjectedReference<any>): void {
        const bundleContext = this.bundleContext = componentContext.getBundleContext();
        const serviceResolver = this.serviceResolver = new ServiceResolver({});
        serviceResolver.setBundleCtx(bundleContext);
    }
    /**
     * Method that enables the hierarchical search function of the bundle
     * @param event emitted by clickHandler, on click, use to access clicked tool
     *
     */
    public showHierarchicalSearchTool(event: any): void {
        this.hideWidget();
        const tool = event.tool;
        const storeId = tool.storeId;
        this.store = this.getStore(storeId);
        const fields = tool.fields;
        this.mapActions = tool.mapActions;
        this.mapActionsConfig = tool.mapActionsConfig;

        const model = this._hierarchicalSearchModel;
        const envs = this.bundleContext.getCurrentExecutionEnvironment();
        model.isMobile = envs.some((env) => env.name === "Mobile");
        model.fields = this.getFields(fields);
        this.setUpSelect(0);

        let widget;
        if (this.widget) {
            widget = this.widget;
        } else {
            widget = this.widget = this.getHierarchicalSearchWidget();
        }
        const vm = widget.getVM();
        vm.showResultUIButton = tool.showResultUIButton;

        const serviceProperties = {
            "widgetRole": "hierarchicalSearchWidget"
        };
        const interfaces = ["dijit.Widget"];
        this.widgetServiceRegistration = this.bundleContext.registerService(interfaces, widget, serviceProperties);
        setTimeout(() => {
            const window: any = ct_util.findEnclosingWindow(widget);
            if (window) {
                window.set("title", tool.title);
                window.on("Close", () => {
                    this.hideWidget();
                    this.resetSearch();
                });
            }
        }, 100);
    }

    /**
     * creates widget with eventhandlers and binding
     * @returns VueDijit created widget
     */
    public getHierarchicalSearchWidget(): VueDijit {
        const model = this._hierarchicalSearchModel;
        const vm = new Vue(HierarchicalSearchWidget);
        vm.i18n = this._i18n.get().ui;
        vm.$on("search", () => {
            this.search();
        });
        vm.$on("displaysearch", () => {
            this.displaysearch();
        });

        vm.$on("reset", () => {
            this.resetSearch();
        });

        vm.$on('selected', (field: Field, index: number) => {
            this.selectChanged(field, index);
        });

        Binding.for(vm, model)
            .syncAll("fields", "searchButtonLoading", "tableButtonLoading")
            .enable()
            .syncToLeftNow();

        return VueDijit(vm);
    }


    private hideWidget(): void {
        const registration = this.widgetServiceRegistration;

        // clear the reference
        this.widgetServiceRegistration = null;
        if (registration) {
            // call unregister
            registration.unregister();
        }
    }

    private getFields(initialFields: Array<object>): Array<Field> {
        const fields: Array<Field> = initialFields.map((field: Field) => {
            field.value = null;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });

        return fields;
    }

    private setUpSelect(index: number): void {
        const model = this._hierarchicalSearchModel;
        const fields = model.fields;

        if (fields.length > index) {
            const field: Field = fields[index];
            field.disabled = false;
            field.loading = true;
            this.queryDistinctValues(field, index);
        }
    }

    private queryDistinctValues(field: Field, index: number): void {
        const queryUrl = this.store.target;
        if (!queryUrl) {
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
            const complexQuery = this.getComplexQuery();
            queryObject.where = ComplexQueryToSQL.toSQLWhere(complexQuery, {});
        }
        query.executeQueryJSON(this.store.target, queryObject).then(function (response) {
            response.features.forEach((feature) => {
                field.items.push(feature.attributes[fieldName]);
            });
            field.loading = false;
        });
    }
    /**
     * Performs the search and hides widegt for mobile devices afterwards
     */
    public search(): void {
        const model = this._hierarchicalSearchModel;

        this.queryResults();
        if (model.isMobile) {
            this.hideWidget();
        }
    }
    public async displaysearch(): Promise<void>{
        const model = this._hierarchicalSearchModel;
        model.tableButtonLoading = true;
        const dataTableFactory = this._resultViewerService.dataTableFactory;
        const query = this.getComplexQuery();
        const dataTable = await dataTableFactory.createDataTableFromStoreAndQuery(
            {
                dataTableTitle: this.dataTableTitle,
                dataSource: this.store,
                queryExpression: query,
                queryOptions: {},
                filter: Filter(this.store, query, {})
            }
        );
        const dataset = dataTable.dataset;
        const datasetStateHandle = dataset.watch("state", (event) => {
            const newState = event.value;
            if (newState === "initialized" || newState === "init-error") {
                model.tableButtonLoading = false;
            }
        });
        const tableCollection = dataTableFactory.createDataTableCollection([dataTable]);
        const resultViewerServiceHandle = this._resultViewerService.open(tableCollection);

    }

    private queryResults(): Object {
        const model = this._hierarchicalSearchModel;

        model.searchButtonLoading = true;
        const store = this.store;
        const query = this.getComplexQuery();
        const filter = Filter(store, query, {});
        return filter.query({}, { fields: { geometry: 1 } }).then((results: Array<object>) => {
            model.searchButtonLoading = false;
            if (results.length) {
                // Access configured map-actions and their configs
                const mapActions = this.mapActions;
                const mapActionsConfig = this.mapActionsConfig;
                // Add further parameters to configurations taken from app.json
                mapActionsConfig.items = results;
                mapActionsConfig.source = store;
                mapActionsConfig.query = query;
                mapActionsConfig.filter = filter;

                // Trigger map-actions with complete set of configurations
                this._actionService.trigger(mapActions, mapActionsConfig);
            } else {
                this._logService.warn({
                    id: 0,
                    message: model._i18n.get().noResultsError
                });
            }
        }, (error) => {
            this._logService.error({
                id: error.code,
                message: error
            });
            model.loading = false;
        });
    }

    private getComplexQuery(): any {
        const query = {};
        if (!query["$or"]) {
            query["$or"] = [];
        }
        const searchObject = this.getSearchObject();
        query["$or"].push(searchObject);

        return query;
    }

    private getSearchObject(): Object {
        const model = this._hierarchicalSearchModel;

        const searchObj = {};
        model.fields.forEach((field: Field) => {
            if (field && field.value) {
                searchObj[field.name] = field.value;
            }
        });

        return searchObj;
    }

    /**
     * Method that monitors changes in the search input.
     * @param field current field
     * @param index index of the field
     */
    public selectChanged(field: Field, index: number): void {
        const model = this._hierarchicalSearchModel;

        const fields = model.fields;
        const nextIndex = index + 1;
        if (!field.value) {
            this.resetSelects(index);
        } else if (fields.length > nextIndex) {
            this.setUpSelect(index + 1);
        } else if (fields.length === nextIndex) {
            this.search();
        }
    }

    private resetSelects(index: number): void {
        const model = this._hierarchicalSearchModel;

        const fields = model.fields;
        // reset fields after the current changed
        fields.forEach((field: Field, i: number) => {
            if (i > index) {
                field.items = [];
                field.value = null;
                field.disabled = true;
            }
        });
    }

    private resetSearch(): void {
        const model = this._hierarchicalSearchModel;

        model.fields[0].value = undefined; // reset first field
        this.resetSelects(0); // reset subsequent fields

        const actionService = this._actionService;
        actionService.trigger(["highlight"], { items: [] }); // reset highlight
    }

    private getStore(id) {
        return this.serviceResolver.getService("ct.api.Store", `(id=${id})`);
    }

}
