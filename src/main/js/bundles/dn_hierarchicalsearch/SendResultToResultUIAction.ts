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
import ComplexQuery from "@conterra/ct-mapapps-typings/store-api/ComplexQuery";
import type { ResultViewerService } from "result-api/api";

export default class SendResultToResultUIAction {

    private resultViewerService: ResultViewerService;
    private _i18n: any;

    async executeAction(store: any, query: ComplexQuery) {
        const dataTableFactory = this.resultViewerService.dataTableFactory;
        const title = this._i18n.get().ui.resultUiTitle;

        const dataTable = await dataTableFactory.createDataTableFromStoreAndQuery({
            dataTableTitle: title,
            dataSource: store,
            queryExpression: query,
            queryOptions: {}
        });

        const dataTableCollection = dataTableFactory.createDataTableCollection([dataTable]);
        this.resultViewerService.open(dataTableCollection);
        }
    }
