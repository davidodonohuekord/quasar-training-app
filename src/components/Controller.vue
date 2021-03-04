<template>
<div class="controller" :style="controllerStyle">
    <span v-for="(square, index) in btnArray" :key="index" :class="square.style">
        {{square.label ? square.label: null}}
    </span>
</div>
</template>


<script>
    export default {
        props: ['controllerDetails'],
        data() {
            return {
                dimensions: {
                    x: null,
                    y: null,
                },
                btnArray: [],
                controllerStyle: null,
            }
        },
        mounted(){
            var maxCol = 0;
            var maxRow = 0;
            
            for (let i = 0; i < this.controllerDetails.buttons.length; i++){
                if (this.controllerDetails.buttons[i].x > maxCol){
                    maxCol = this.controllerDetails.buttons[i].x;
                }
                if (this.controllerDetails.buttons[i].y > maxRow){
                    maxRow = this.controllerDetails.buttons[i].y;
                }
            }
            this.dimensions.x = maxCol;
            this.dimensions.y = maxRow;
            this.controllerStyle = {
                'grid-template-rows': 'repeat(' + maxRow + ', 100px)',
                'grid-template-columns': 'repeat(' + maxCol + ', 100px)'
            };
            this.refreshArray();
        },
        watch: {
            controllerDetails:{
                deep: true,
                immediate: true,
                handler: "refreshArray",
            }
        },
        methods: {
            refreshArray(){
                this.btnArray = [];
                for (let i = 0; i < (this.dimensions.x * this.dimensions.y); i++){
                    this.btnArray.push({
                        style: "not-button"
                    });
                }
                for (let i = 0; i < this.controllerDetails.buttons.length; i++){
                    var num = ((this.controllerDetails.buttons[i].y - 1) * this.dimensions.x + this.controllerDetails.buttons[i].x);
                    var style = this.controllerDetails.buttons[i].active ? "active-button" : "inactive-button";
                    this.btnArray.splice(num - 1, 1, {
                        style,
                        label: this.controllerDetails.buttons[i].label,
                    });
                }
            }
        },
        // computed: {
        //     dimensions(){
        //         var maxCol = 0;
        //         var maxRow = 0;
        //         var btnArray = [];
                
        //         for (let i = 0; i < this.controllerDetails.buttons.length; i++){
        //             if (this.controllerDetails.buttons[i].x > maxCol){
        //                 maxCol = this.controllerDetails.buttons[i].x;
        //             }
        //             if (this.controllerDetails.buttons[i].y > maxRow){
        //                 maxRow = this.controllerDetails.buttons[i].y;
        //             }
        //         }

        //         for (let i = 0; i < (maxCol * maxRow); i++){
        //             btnArray.push({
        //                 style: "not-button"
        //             })
        //         }

        //         for (let i = 0; i < this.controllerDetails.buttons.length; i++){
        //             var num = ((this.controllerDetails.buttons[i].y - 1) * maxCol + this.controllerDetails.buttons[i].x);
        //             var style = this.controllerDetails.buttons[i].active ? "active-button" : "inactive-button";
        //             btnArray.splice(num - 1, 1, {
        //                 style,
        //                 label: this.controllerDetails.buttons[i].label,
        //             });
        //         }
        //         return {
        //             x:maxCol,
        //             y:maxRow,
        //             btnArray
        //         }
        //     }
        // }
    }
</script>



<style scoped>
* {
    margin: 0;
    padding: 0;
    max-height: 100%;
    max-width: 100%;
}

.controller {
    display: grid;

}

.active-button {
    width:100px;
    height: 100px;
    background-color: green;
}

.inactive-button {
    width:100px;
    height: 100px;
    background-color: gray;
}

.not-button {
    width: 100px;
    height: 100px;
}
</style>