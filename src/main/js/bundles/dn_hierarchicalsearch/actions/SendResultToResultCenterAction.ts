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

export default class SendResultToResultCenterAction {

    public id: string;
    public immediate: boolean;

    private logService: any;
    private dataModel: any;
    private _i18n: any;

    constructor() {
        // unique ID of the action
        this.id = "sendResultToResultCenter";
        // this is a sequential action
        this.immediate = false;
    }

    // trigger method which is called with the search result items
    async trigger(options: any): Promise<void> {
        if (this.dataModel) {
            const items = options.items;
            const filter = options.filter;

            if (items.length) {
                this.dataModel.setDatasource(filter);
            } else {
                return;
            }
        } else {
            const warning = this._i18n.get().ui.resultcenterWarning;
            this.logService.warn({
                id: 0,
                message: warning
            });
        }
    }
}
