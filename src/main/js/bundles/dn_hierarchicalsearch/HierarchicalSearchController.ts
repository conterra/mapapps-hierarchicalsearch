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

import * as query from "esri/rest/query";
import Query from "esri/rest/support/Query";
import Filter from "ct/store/Filter";
import ComplexQueryToSQL from "ct/store/ComplexQueryToSQL";
import HierarchicalSearchModel from "./HierarchicalSearchModel";

import { Field } from "./Interfaces";

export default class HierarchicalSearchController {

    private actionService: any;
    private hierarchicalSearchModel: typeof HierarchicalSearchModel;

    getFields(initialFields: Array<object>){
        const fields: Array<Field> = initialFields.map((field: Field) => {
            field.value = null;
            field.loading = false;
            field.disabled = true;
            field.items = [];
            return field;
        });

        return fields;
    }

    _setUpSelect(index: number): void {
        const model = this.hierarchicalSearchModel;
        const fields = model.fields;

        if (fields.length > index) {
            const field: Field = fields[index];
            field.disabled = false;
            field.loading = true;
            this._queryDistinctValues(field, index);
        }
    }

    _queryDistinctValues(field: Field, index: number): void {
        const model = this.hierarchicalSearchModel;

        const queryUrl = model.store.target;
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
        query.executeQueryJSON(model.store.target, queryObject).then(function (response) {
            response.features.forEach((feature) => {
                field.items.push(feature.attributes[fieldName]);
            });
            field.loading = false;
        });
    }

    search(): void {
        const model = this.hierarchicalSearchModel;

        this._queryResults();
        if (model.isMobile) {
            model.tool.set("active", false);
        }
    }

    _queryResults(): Object {
        const model = this.hierarchicalSearchModel;

        model.loading = true;
        const store = model.store;
        const query = this._getComplexQuery();
        const filter = new Filter(store, query, {});
        return filter.query({}, {fields: {geometry: 1}}).then((results: Array<object>) => {
            model.loading = false;
            if (results.length) {
                // Access configured map-actions and their configs
                const mapActions = model.mapActions
                const mapActionsConfig = model.mapActionsConfig;
                // Add further parameters to configurations taken from app.json
                mapActionsConfig.items = results;
                mapActionsConfig.source = store;
                mapActionsConfig.query = query;
                mapActionsConfig.filter = filter;

                // Trigger map-actions with complete set of configurations
                model.actionService.trigger(mapActions, mapActionsConfig);
            } else {
                model.logService.warn({
                    id: 0,
                    message: model._i18n.get().noResultsError
                });
            }
        }, (error) => {
            model.logService.error({
                id: error.code,
                message: error
            });
            model.loading = false;
        });
    }

    _getComplexQuery(): __esri.query {
        const query = {};
        if (!query["$or"]) {
            query["$or"] = [];
        }
        const searchObject = this._getSearchObject();
        query["$or"].push(searchObject);

        return query;
    }

    _getSearchObject(): Object {
        const model = this.hierarchicalSearchModel;

        const searchObj = {};
        model.fields.forEach((field: Field) => {
            if (field && field.value) {
                searchObj[field.name] = field.value;
            }
        });

        return searchObj;
    }


    selectChanged(field: Field, index: number): void {
        const model = this.hierarchicalSearchModel;

        const fields = model.fields;
        const nextIndex = index + 1;
        if (!field.value) {
            this._resetSelects(index);
        } else if (fields.length > nextIndex) {
            this._setUpSelect(index + 1);
        } else if (fields.length === nextIndex) {
            this.search();
        }
    }

    _resetSelects(index: number): void {
        const model = this.hierarchicalSearchModel;

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
}
