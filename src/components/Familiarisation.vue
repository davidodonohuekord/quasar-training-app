<template>
<div class="main">
    <h1 text-h1>Familiarisation</h1>
    <div class="familiarisationMain">
        <controller :controllerDetails="configObject" />
    </div>
    <q-btn color="primary" label="Begin test" @click="begin" />
</div>
</template>

<script>
import Controller from './Controller.vue'
    export default {
        components: { Controller },
        props: ["configObject"],
        data() {
            return {
                columns: [
                    { name: 'fn', align: 'center', label: 'Fn', field: 'fn', sortable: true },
                    { name: 'sequence', align: 'center', label: 'Sequence', field: 'buttonSequence', sortable: true },
                ]
            }
        },
        methods: {
            begin(){
                this.$emit('next')
            }
        }
    }
</script>

<style scoped>

.familiarisationMain {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
}

</style>