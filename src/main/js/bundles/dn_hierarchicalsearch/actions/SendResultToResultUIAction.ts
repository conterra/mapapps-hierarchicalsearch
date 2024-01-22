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

import type { ResultViewerService } from "result-api/api";

export default class SendResultToResultUIAction {

    public id: string;
    public immediate: boolean;

    private logService: any;
    private resultViewerService: ResultViewerService;
    private _i18n: any;

    constructor() {
        // unique ID of the action
        this.id = "sendResultToResultUI";
        // this is a sequential action
        this.immediate = false;
    }

    // trigger method which is called with the search result items
    async trigger(options: any): Promise<void> {
        if (this.resultViewerService) {
            const store = options.source;
            const query = options["query"];
            const metadata = await store.getMetadata();

            const dataTableFactory = this.resultViewerService.dataTableFactory;
            const title = metadata.title || this._i18n.get().ui.resultUiTitle;

            const dataTable = await dataTableFactory.createDataTableFromStoreAndQuery({
                dataTableTitle: title,
                dataSource: store,
                queryExpression: query,
                queryOptions: {}
            });

            const dataTableCollection = dataTableFactory.createDataTableCollection([dataTable]);
            this.resultViewerService.open(dataTableCollection);
        }
        else {
            const warning = this._i18n.get().ui.resultUiWarning;
            this.logService.warn({
                id: 0,
                message: warning
            });
        }
    }

}
