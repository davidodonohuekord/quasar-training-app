<template>
<div class="main">
    <div class="q-gutter-sm">
        <q-radio v-model="mode" val="keyboard" label="Keyboard" />
        <q-radio v-model="mode" val="other" label="RIC" />
    </div>
    <div class="controller" :style="controllerStyle" :key="mode">
        <div v-for="(button, index) in controller.buttons" :key="index" class="button" :class="{active: button.active, inactive: !button.active}" :style="{'grid-column-start': button.x, 'grid-column-end': (button.x + 1), 'grid-row-start': button.y, 'grid-row-end': (button.y + 1)}" >
            {{button.label ? button.label: null}}
        </div>
    </div>
</div>
</template>


<script>

import * as engine from './Engine.js'

    export default {
        props: ['controllerDetails'],
        data() {
            return {
                controller: {
                    buttons: null,
                },
                controllerStyle: null,
                dimensions: {
                    x: 0,
                    y: 0
                },
                mode: "keyboard",
                engine: null,
            }
        },
        methods: {
            // keyDown(event){
            //     var state = event.key.charCodeAt(0) - 97;
              
            //     for (let i = 0; i < this.controller.buttons.length; i++){
            //         if (this.controller.buttons[i].chordValue & state) {
            //             if (!this.controller.buttons[i].active){
            //                 this.controller.buttons[i].active = true;
            //             }
            //         } else if (this.controller.buttons[i].active){
            //             this.controller.buttons[i].active = false;
            //         }
            //     }
            // }
            stateChange(event){
                var buttons = event.detail.buttons;
                for (let i = 0; i < this.controller.buttons.length; i++){
                    if (buttons.includes(this.controller.buttons[i].chordValue)) {
                        if (!this.controller.buttons[i].active){
                            this.controller.buttons[i].active = true;
                        }
                    } else if (this.controller.buttons[i].active){
                        this.controller.buttons[i].active = false;
                    }
                }
            },
            operated(event){
            },
            break(event){
                // do nothing
            }
        },
        watch: {
            mode(){
                this.engine.delete();
                this.engine = new engine.Engine(this.controllerDetails, this.mode);
            }
        },
        mounted() {
            this.controller = this.controllerDetails;
            this.engine = new engine.Engine(this.controllerDetails, this.mode);
            window.addEventListener("stateChange", this.stateChange.bind(this));
            window.addEventListener("operated", this.operated.bind(this));
            window.addEventListener("break", this.break.bind(this));
            for (let i = 0; i < this.controller.buttons.length; i++){
                this.$set(this.controller.buttons[i], 'active', false);
                if (this.controller.buttons[i].x > this.dimensions.x){
                    this.dimensions.x = this.controller.buttons[i].x;
                }
                if (this.controller.buttons[i].y > this.dimensions.y){
                    this.dimensions.y = this.controller.buttons[i].y;
                }
            }
            this.controllerStyle = {
                'grid-template-rows': 'repeat(' + this.dimensions.y + ', 100px)',
                'grid-template-columns': 'repeat(' + this.dimensions.x + ', 100px)'
            };
        }
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

.button {
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid black;
    width: 100px;
    height: 100px;
}

.active {
    background-color: green;
}

.inactive {
    background-color: white;
}

</style>