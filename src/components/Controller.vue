<template>
<div class="controller" :style="controllerStyle">
    <div v-for="(square, index) in btnArray" :key="index" :class="square.btnClass" :style="square.btnStyle" >
        {{square.label ? square.label: null}}
    </div>
</div>
</template>


<script>
    export default {
        props: ['controllerDetails'],
        data() {
            return {
                dimensions: {
                    x: 0,
                    y: 0,
                    maxBtnWidth: 0,
                    maxBtnHeight: 0,
                },
                btnArray: [],
                controllerStyle: null,
                controller: [],
            }
        },
        mounted(){
            this.controller = [...this.controllerDetails.buttons];
            window.addEventListener("keydown", this.keyDown);
            window.addEventListener("keyup", this.keyUp);
            
            for (let i = 0; i < this.controller.length; i++){
                if (this.controller[i].x > this.dimensions.x){
                    this.dimensions.x = this.controller[i].x;
                }
                if (this.controller[i].y > this.dimensions.y){
                    this.dimensions.y = this.controller[i].y;
                }
                if (this.controller[i].width > this.dimensions.maxBtnWidth){
                    this.dimensions.maxBtnWidth = this.controller[i].width;
                }
                if (this.controller[i].height > this.dimensions.maxBtnHeight){
                    this.dimensions.maxBtnHeight = this.controller[i].height;
                }
            }
            this.controllerStyle = {
                'grid-template-rows': 'repeat(' + this.dimensions.y + ', ' + this.dimensions.maxBtnHeight + 'px)',
                'grid-template-columns': 'repeat(' + this.dimensions.x + ', ' + this.dimensions.maxBtnWidth + 'px)'
            };
            this.refreshArray();
        },
        methods: {
            keyDown(event){
                var index = this.controller.findIndex(x => x.key == event.key);
                if (index != -1){
                    this.controller[index].active = true;
                    this.refreshArray();
                }
            },
            keyUp(event){
                var index = this.controller.findIndex(x => x.key == event.key);
                if (index != -1){
                    this.controller[index].active = false;
                    this.refreshArray();
                }
            },
            refreshArray(){
                this.btnArray = [];
                for (let i = 0; i < (this.dimensions.x * this.dimensions.y); i++){
                    this.btnArray.push({
                        btnClass: "not-button"
                    });
                }
                for (let i = 0; i < this.controller.length; i++){
                    var num = ((this.controller[i].y - 1) * this.dimensions.x + this.controller[i].x);
                    var btnClass = "btn";
                    var btnStyle = "width: " + this.controller[i].width + "px; height: " + this.controller[i].height + "px; " 
                        + "background-color: " + (this.controller[i].active ? this.controller[i].activeColour : this.controller[i].inactiveColour) + "; "
                        + "border: 2px solid " + this.controller[i].activeColour;
                    this.btnArray.splice(num - 1, 1, {
                        btnStyle,
                        btnClass,
                        label: this.controller[i].label,
                    });
                }
            }
        },
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
    justify-items: center;
    align-items: center;
    column-gap: 5px;
    row-gap: 5px;
}

.btn {
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>