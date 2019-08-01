<template>
    <div class="hierarchicalsearch">
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
                        color="primary"
                        clearable
                        open-on-clear
                        hide-details
                        @input="$emit('selected', field, index)"
                    />
                </v-flex>
            </v-layout>
        </v-container>
        <v-btn
            block
            ripple
            color="primary"
            :disabled="!fields[0].value"
            :loading="loading"
            @click="$emit('search')">
            <v-icon left>
                search
            </v-icon>
            {{ i18n.search }}
        </v-btn>
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
                    return {}
                }
            },
            loading: {
                type: Boolean,
                default: false
            },
            fields: {
                type: Array,
                default: () => []
            }
        }
    };
</script>
