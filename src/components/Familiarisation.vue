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