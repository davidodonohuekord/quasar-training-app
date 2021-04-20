<template>
<div class="main">
    <div class="header">
    <img v-if="content.logo1" :src="content.logo1" class="img"/>
    <h3 text-h3 v-if="content.title">{{content.title}}</h3>
    <img v-if="content.logo2" :src="content.logo2" class="img"/>
    </div>
<q-btn color="primary" label="Begin familiarisation" @click="navigateTo('Familiarisation')" />
<!-- <q-btn color="primary" label="Start waterfall" @click="navigateTo('Waterfall')" /> -->
</div>
</template>

<script>
    export default {
        props: ["content"],
        methods: {
            navigateTo(target) {
                this.$emit('navigate-to', target);
            }
        }
    }
</script>

<style scoped>

.img {
    object-fit: cover;
    width: 20vw;
}

.header {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
}

</style>