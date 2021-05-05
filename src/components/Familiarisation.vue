<template>
<div class="main">
    <span text-body1>Learn the numbering system by pressing buttons on your Controller. When done, click the "Begin Test" button.</span>
    <div class="familiarisationMain">
        <shadowpad-engine :controllerDetails="configObject" />
        <!-- <controller :controllerDetails="configObject" /> -->
    </div>
    <q-btn color="primary" label="Begin test" @click="begin" />
</div>
</template>

<script>
import Controller from './Controller.vue'
import ShadowpadEngine from './Shadowpad.vue'
    export default {
        components: { Controller, ShadowpadEngine },
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