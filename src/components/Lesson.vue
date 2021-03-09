<template>
    <div class="main">
        <h1 text-h1>Lesson: {{this.stages[this.currentStage]}}</h1>
        <p textbody-1>
            Target operation: {{this.currentQuestion.targetOperation}}<br>
            {{this.currentQuestion.prompt && this.showPrompt ? this.currentQuestion.prompt : null}}
        </p>
        <div class="lessonMain">
            <controller :controllerDetails="configObject" />
            <span>Target sequence<br>{{this.currentQuestion.targetSequence}}</span>
            <span>Outcome<br>{{this.outcome}}</span>
        </div>
        <div class="progress">
            <q-linear-progress size="25px" style="width: 20vw" :value="progress[0]" />
            <q-linear-progress size="25px" style="width: 20vw" :value="progress[1]" />
            <q-linear-progress size="25px" style="width: 20vw" :value="progress[2]" />
            <q-linear-progress size="25px" style="width: 20vw" :value="progress[3]" />
        </div>
    </div>
</template>

<script>

import Controller from './Controller.vue'
import * as chordEngine from '../ChordEngine'

    export default {
        components: { Controller },
        props: ["configObject"],
        data() {
            return {
                engine: null,
                lessonPlan: {
                    intro: [],
                    practice: [],
                    review: [],
                    test: []
                },
                currentQuestion: {
                    prompt: null,
                    targetOperation: null,
                },
                currentStage: 0,
                showPrompt: true,
                stages: ["intro", "practice", "review", "test"],
                progress: [0, 0, 0, 0],
                completed: [0, 0, 0, 0],
                outcome: null,
            }
        },
        methods: {
            arrayEquals(first, second){
                if (first.length != second.length){
                    return false;
                }
                for (let i = 0; i < first.length; i++){
                    if (first[i] != second[i]){
                    return false;
                    }
                }
                return true;
            },
            generateLessonPlan(){
                // for each function on controller
                for (let i = 0; i < this.configObject.rules.length; i++){
                    // add introCount to intro section of lesson plan
                    for (let j = 0; j < this.configObject.rules[i].introCount; j++) {
                        this.lessonPlan.intro.push(
                            {prompt: this.configObject.rules[i].prompt,
                            targetSequence: this.configObject.rules[i].sequence,
                            targetOperation: this.configObject.rules[i].operationName}
                        )
                    }
                    // shuffle it
                    // this.lessonPlan.intro = this.shuffle(this.lessonPlan.intro);
                    // add practiceCount to practice section of lesson plan
                    for (let j = 0; j < this.configObject.rules[i].practiceCount; j++) {
                        this.lessonPlan.practice.push(
                            {prompt: this.configObject.rules[i].prompt,
                            targetSequence: this.configObject.rules[i].sequence,
                            targetOperation: this.configObject.rules[i].operationName}
                        )
                    }
                    // shuffle it
                    this.lessonPlan.practice = this.shuffle(this.lessonPlan.practice);
                    // add reviewCount to review section of lesson plan
                    for (let j = 0; j < this.configObject.rules[i].reviewCount; j++) {
                        this.lessonPlan.review.push(
                            {prompt: this.configObject.rules[i].prompt,
                            targetSequence: this.configObject.rules[i].sequence,
                            targetOperation: this.configObject.rules[i].operationName}
                        )
                    }
                    // shuffle it
                    this.lessonPlan.review = this.shuffle(this.lessonPlan.review);
                    // add tesingCount to testing section of lesson plan
                    for (let j = 0; j < this.configObject.rules[i].testCount; j++) {
                        this.lessonPlan.test.push(
                            {targetSequence: this.configObject.rules[i].sequence,
                            targetOperation: this.configObject.rules[i].operationName}
                        )
                    }
                    // shuffle it
                    this.lessonPlan.test = this.shuffle(this.lessonPlan.test);
                }
                this.nextQuestion();
            },
            shuffle(array) {
                var m = array.length, t, i;

                // While there remain elements to shuffle
                while (m) {

                    // Pick a remaining element…
                    i = Math.floor(Math.random() * m--);

                    // And swap it with the current element.
                    t = array[m];
                    array[m] = array[i];
                    array[i] = t;
                }
                return array;
            },
            // sets currentQuestion to the next question in the lesson plan
            nextQuestion() {
                this.progress[this.currentStage] = this.completed[this.currentStage] / (this.lessonPlan[this.stages[this.currentStage]].length);
                // if current stage has been completed
                if (this.lessonPlan[this.stages[this.currentStage]].length == this.completed[this.currentStage]){
                    this.currentStage += 1;
                }
                if (this.currentStage == 4){
                    // TODO testing has been finished, handle the end somehow
                    this.$emit('next');
                } else {
                    this.currentQuestion = this.lessonPlan[this.stages[this.currentStage]][this.completed[this.currentStage]];
                }
            },
        },
        mounted() {
            this.engine = new chordEngine.ChordEngine(this.configObject.buttons);
            window.addEventListener("keydown", this.engine.keyDown.bind(this.engine));
            window.addEventListener("keyup", this.engine.keyUp.bind(this.engine));
            this.engine.addRule(this.engine, this.configObject.rules);
            this.generateLessonPlan();
        },
        watch: {
            engine: {
                deep: true,
                handler: function (n, o){
                    if (n.lastOperation != null){
                        if (n.lastOperation == this.currentQuestion.targetOperation){
                            // answer is correct
                            this.outcome = "Correct!";
                            if (this.showPrompt){
                                this.showPrompt = false;
                            } else {
                                this.showPrompt = true;
                                this.completed[this.currentStage] += 1;
                            }
                        } else {
                            // answer is incorrect, cycle it to the back
                            // TODO: add more if testing stage?
                            this.outcome = "Incorrect!!!!";
                            if (this.currentStage == 3){
                                this.progress[3] = 0;
                                this.currentStage = 2;
                                this.completed[2] = 0;
                                this.completed[3] = 0;
                            } else {
                                var tmp = this.lessonPlan[this.stages[this.currentStage]].shift();
                                this.lessonPlan[this.stages[this.currentStage]].push(tmp);
                                if (this.currentStage == 1) {
                                    // if it's the practice stage, add an extra practice to a random place
                                    var index = Math.floor(Math.random() * (this.lessonPlan[this.stages[this.currentStage]].length - this.completed[this.currentStage])) + this.completed[this.currentStage];
                                    this.lessonPlan[this.stages[this.currentStage]].splice(index, 0, tmp);
                                }
                            }
                        }
                        this.nextQuestion();
                    }
                }
            }
        }
    }
</script>

<style scoped>

.lessonMain {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
}

.progress {
    display: flex;
    flex-direction: row;
}


</style>