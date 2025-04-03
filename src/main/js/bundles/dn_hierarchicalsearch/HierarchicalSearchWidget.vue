<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <div class="hierarchicalsearch">
        <v-container
            class="pa-0"
            fluid
            grid-list-md
        >
            <v-layout>
                <v-flex
                    v-for="(field, index) in fields"
                    :key="index"
                >
                    <v-combobox
                        v-model="field.value"
                        :items="field.items"
                        :label="field.label"
                        :aria-label="field.label"
                        :disabled="fieldIsDisabled(field)"
                        :aria-disabled="fieldIsDisabled(field)"
                        :loading="field.loading"
                        color="primary"
                        clearable
                        open-on-clear
                        hide-details
                        @input="$emit('selected', field, index)"
                    />
                </v-flex>
            </v-layout>
        </v-container>
        <v-container
            class="pa-0 pt-1 text-lg-right"
            fluid
            grid-list-xs
        >
            <v-btn
                class="ml-0 mr-1"
                shrink
                ripple
                color="primary"
                :aria-label="i18n.search"
                :disabled="buttonIsDisabled"
                :aria-disabled="buttonIsDisabled"
                :loading="searchButtonLoading"
                @click="$emit('search')"
            >
                <v-icon left>
                    search
                </v-icon>
                {{ i18n.search }}
            </v-btn>
            <v-btn
                class="ml-1 mr-0"
                shrink
                ripple
                color="secondary"
                :aria-label="i18n.reset"
                :disabled="buttonIsDisabled"
                :aria-disabled="buttonIsDisabled"
                @click="$emit('reset')"
            >
                <v-icon left>
                    icon-undo
                </v-icon>
                {{ i18n.reset }}
            </v-btn>
        </v-container>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

    export default {
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {};
                }
            }
        },
        data() {
            return {
                fields: [],
                searchButtonLoading: false
            };
        },
        computed: {
            buttonIsDisabled() {
                return !this.fields[0].value;
            }
        },
        methods: {
            fieldIsDisabled(field) {
                return field.disabled;
            }
        }
    };
</script>
