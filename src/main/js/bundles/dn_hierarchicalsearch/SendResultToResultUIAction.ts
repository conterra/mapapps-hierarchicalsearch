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

export default class SendResultToResultUIAction {

    async executeAction(results, store, filter) {

        if (results.length) {
        // only the items with the ids returned by the idsProvider
        // are fetched from the store and shown in the UI
        const idsProvider: DatasetItemIdsProvider = async ({limit}) => {
            // the limit option is the maximal amount of items which will be fetched
            // the id provider may ignore the information or use it to reduce the fetched results
            const result = await store.query({}, {
                count: limit
            });
            return {
                ids: result.map((item) => item.id)
            };
        };

        // dataTableFactory is used to create a DataTableCollection from the store
        const dataTableFactory = this._resultViewerService.dataTableFactory;
        const dataTable = await dataTableFactory.createDataTableFromStore({
            dataTableTitle: "MyTopic",
            dataSource: store,
            idsProvider,
            queryExpression: "1=1"
        });

        const dataTableCollection = dataTableFactory.createDataTableCollection([dataTable]);
        this._resultViewerService.open(dataTableCollection);
        } else {
            return;
        }
    }

}
