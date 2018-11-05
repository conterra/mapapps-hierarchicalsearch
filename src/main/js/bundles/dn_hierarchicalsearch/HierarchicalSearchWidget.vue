<template>
    <div class="hierarchicalsearch">
        <div class="top">

            <v-progress-linear v-if="loading" :active="loading" :indeterminate="true"
                               class="pa-0 ma-0"></v-progress-linear>
            <v-container fluid grid-list-md fill-height>
                <v-layout ct-flex-container>
                    <v-flex ct-flex-item>
                        <v-select
                            :items="subdistrict"
                            v-model="subdistrictData"
                            v-bind:label="subdistrictLabel"
                            combobox
                            v-on:input="$emit('subdistrictSelected', {subdistrictData})"
                            outline
                            clearable="true"
                            open-on-clear="true"
                            :disabled="loading"
                        ></v-select>
                    </v-flex>
                    <v-flex ct-flex-item>
                        <v-select
                            :items="field"
                            v-model="fieldData"
                            v-bind:label="fieldLabel"
                            outline
                            combobox
                            :disabled="subdistrictSelected"
                            v-on:input="$emit('fieldSelected', {})"
                            clearable="true"
                            open-on-clear="true"
                        ></v-select>
                    </v-flex>
                    <v-flex ct-flex-item v-if="threeSelects">
                        <v-select
                            :items="parcel"
                            v-model="parcelData"
                            v-bind:label="parcelLabel"
                            outline
                            combobox
                            :disabled="fieldSelected"
                            v-on:input="$emit('parcelSelected', {})"
                            clearable="true"
                            open-on-clear="true"
                        ></v-select>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

    export default {
        mixins: [Bindable],
        data: function () {
            return {
                loading: false,
                subdistrict: [],
                subdistrictLabel: "",
                subdistrictData: undefined,
                subdistrictSelected: true,
                field: [],
                fieldLabel: "",
                fieldData: undefined,
                fieldSelected: true,
                parcel: [],
                parcelLabel: "",
                parcelData: undefined,
                parcelSelected: true,
                threeSelects: undefined,
            };
        }
    };
</script>
