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
export default class ZoomToResultAction{
    activate() {
        this.mapModel = this._mapWidgetModel;

    }

    executeAction(results, store, filter) {
        let selectedGeometry = results[0];
        //this.mapModel.view.goTo(selectedGeometry.feature);
        if (selectedGeometry.geometry.type === 'polygon') {
            this.mapModel.view.extent = selectedGeometry.geometry.extent;
            this.mapModel.view.zoom = this.mapModel.view.zoom - 2;
        }
        else {
            this.mapModel.view.center = [selectedGeometry.geometry.longitude, selectedGeometry.geometry.latitude];
            this.mapModel.view.zoom = 10;
        }
    }
}
