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

import { Mutable, properties } from "apprt-core/Mutable";
import { Field } from "./Interfaces";

function defineProperties<Impl, P>(mutableDefinition: any,
    mutableProperties: P): Impl & Mutable<P> {
    properties(mutableDefinition, mutableProperties);
    return mutableDefinition;
}

class HierarchicalSearchModel extends Mutable {
}

interface HierarchicalSearchModelProps {
    fields: Field[];
    searchButtonLoading: boolean;
    tableButtonLoading: boolean;
    isMobile: boolean;
}

export default defineProperties<HierarchicalSearchModel, HierarchicalSearchModelProps>(HierarchicalSearchModel,
    {
        fields: [],
        searchButtonLoading: false,
        tableButtonLoading: false,
        isMobile: false
    });

