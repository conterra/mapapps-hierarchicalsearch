<template>
    <div class="hierarchicalsearch">
        <v-progress-linear
            v-if="loading"
            :active="loading"
            :indeterminate="true"
            class="pa-0 ma-0"/>
        <v-container
            class="pa-1"
            fluid
            grid-list-md
            fill-height>
            <v-layout>
                <v-flex
                    v-for="(field, index) in fields"
                    :key="index">
                    <v-combobox
                        v-model="field.value"
                        :items="field.items"
                        :label="field.label"
                        :disabled="field.disabled"
                        :loading="field.loading"
                        clearable
                        full-width
                        open-on-clear
                        hide-details
                        @input="$emit('selected', field, index)"
                    />
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

    export default {
        mixins: [Bindable],
        data: function () {
            return {
                loading: false,
                fields: []
            };
        }
    };
</script>
