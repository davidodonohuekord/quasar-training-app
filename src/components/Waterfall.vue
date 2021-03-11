<template>
<div>
    <canvas id="canvas" :width="streamLength" :height="streamWidth * configObject.buttons.length"/>
</div>
</template>

<script>

import * as chordEngine from '../ChordEngine'

    export default {
        props: ['configObject'],
        data() {
            return {
                streamLength: 800,
                streamWidth: 100,
                engine: null,
                canvas: {
                    instance: null,
                    ctx: null,
                },
                buttons: [],
            }
        },
        mounted() {
            // chord engine
            // this.engine = new chordEngine.ChordEngine(this.configObject.buttons);
            // window.addEventListener("keydown", this.engine.keyDown.bind(this.engine));
            // window.addEventListener("keyup", this.engine.keyUp.bind(this.engine));

            // canvas
            this.canvas.instance = document.getElementById('canvas');
            this.canvas.ctx = this.canvas.instance.getContext('2d');

            // populate buttons array
            for (let i = 0; i < this.configObject.buttons.length; i++){
                this.buttons.push({
                    pushed: false,
                    streams: [],
                });
            }
            window.addEventListener("keydown", this.keyDown);
            window.addEventListener("keyup", this.keyUp);

            //start loop
            window.requestAnimationFrame(this.waterfallStream);
        },
        methods: {
            waterfallStream(){
                // clear the canvas
                this.canvas.ctx.clearRect(0,0,this.streamLength, this.streamWidth * this.buttons.length);
                // decrement the value of the start (and end, if present) of every stream
                // for every button
                for (let i = 0; i < this.buttons.length; i++){
                    // for each stream for this button
                    for (let j = 0; j < this.buttons[i].streams.length; j++){
                        this.buttons[i].streams[j].start -= 1;
                        if (this.buttons[i].streams[j].hasOwnProperty("end")){
                            this.buttons[i].streams[j].end -= 1;
                            if (this.buttons[i].streams[j].end < 0){
                                this.buttons[i].streams.splice(j, 1);
                            }
                        }
                    }
                }
                for (let i = 0; i < this.buttons.length; i++){
                    // for each stream for this button
                    for (let j = 0; j < this.buttons[i].streams.length; j++){
                            var width = (this.buttons[i].streams[j].hasOwnProperty("end") ? this.buttons[i].streams[j].end : this.streamLength) - this.buttons[i].streams[j].start;
                            this.canvas.ctx.beginPath();
                            this.canvas.ctx.fillRect(this.buttons[i].streams[j].start, i * this.streamWidth, width, this.streamWidth);
                            this.canvas.ctx.stroke();
                    }
                }
                window.requestAnimationFrame(this.waterfallStream);
            },
            keyDown(event){
                var index = this.configObject.buttons.findIndex(x => x.key == event.key);
                if (index != -1){
                    if (!this.buttons[index].pushed){
                        this.buttons[index].pushed = true;
                        this.buttons[index].streams.push({
                            start:this.streamLength
                        })
                    }
                    
                }
            },
            keyUp(event){
                var index = this.configObject.buttons.findIndex(x => x.key == event.key);
                if (index != -1){
                    if (this.buttons[index].pushed){
                        this.buttons[index].pushed = false;
                        this.buttons[index].streams[this.buttons[index].streams.length - 1].end = this.streamLength;
                    }
                    
                }
            },
        }
    }
</script>