<template>
<div class="main">
    <span text-body1>Learn the numbering system by pression buttons on your Controller. When done, click the "Begin Test" button.</span>
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
                this.$emit('navigate-to', "Lesson")
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