<template>
    <div class="lessonGrid">
        <div class="header">
            <h3 text-h3>{{this.stages[this.currentStage]}}</h3>
        </div>

        <div class="controller">
            <controller :controllerDetails="configObject" />
            <span text-body1>Controller</span>
        </div>
        <div class="prompt">
            <span text-body1>{{this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion] && this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion].prompt}}</span><br>
        </div>
        <div class="function">
            <span class="outcome" text-body1 :style="{color: outcomeColour}">{{this.outcome}}</span>
            <h3 class="targetOperation" text-h3>{{this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion] && this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion].targetOperation}}</h3><br>
            <span class="functionLabel" text-body1>Function</span>
        </div>
        <div class="progress">
            <span v-for="(section, index) in stages" :key="index">
            <span text-body1>{{stages[index]}}</span>
            <q-linear-progress size="25px" style="width: 20vw" :value="progress[index]" />
            </span>
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
                // the engine that displays the controller and determines function outputs
                engine: null,
                // Keeps track of where the current question is in the lesson plan
                // access the current question with this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion]
                currentQuestion: 0,
                // A place to store the timeout associated with clearing the outcome of an answer
                // Needed so that it can be cancelled and reset if the user is answering questions too quickly
                timeout: null,
                // Contains a list for each phase of the lesson
                // Populated by generateLessonPlan()
                // Each question is an object with a prompt and an optional targetOperation
                // Questions with just a prompt will not respond to function activations and
                // will be displayed for a specified time before the app moves to the next question
                lessonPlan: {
                    Introduction: [],
                    Practice: [],
                    Review: [],
                    Test: []
                },
                // Keeps track of which stage in the lesson plan the user is up to
                currentStage: 0,
                // Allows for dynamic access to the fields of lessonPlan using the index of currentStage
                // e.g. this.lessonPlan[this.stages[this.currentStage]] will index into the right property of the lessonPlan
                stages: ["Introduction", "Practice", "Review", "Test"],
                // for the purpose of the GUI progress bar
                // is set by the function updateProgress, which is called whenever a question is answered
                // it is also set by the operated function when a user answers a question incorrectly in the test stage
                progress: [0, 0, 0, 0,0],
                // Briefly stores either Correct! or Incorrect! after the user has activated a function and the
                // program is waiting for the answer to a question
                outcome: null,
            }
        },
        computed: {
            outcomeColour(){
                if (this.outcome == "Correct!"){
                    return "green";
                } else {
                    return "red";
                }
            }
        },
        methods: {
            // Checks if two arrays are equal using one of many possible ways
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
            // Shuffles an array and returns an array with the original elements in a random order
            // Taken from the internet somewhere (I don't remember where)
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
            // This function is to be called either when a question is answered,
            // or when the timeout on a prompt that doesn't expect an answer has expired
            // It will increment the index pointing to the current question/prompt
            // It will increment the stage and reset the index if the current stage has been completed
            // It will also emit a navigation event if the last stage has been completed
            nextQuestion() {
                // increment the question index
                this.currentQuestion += 1;
                // if current stage has been completed
                //console.log("comparing ", this.currentQuestion, " to ");
                if (this.currentQuestion >= this.lessonPlan[this.stages[this.currentStage]].length){
                    // if lesson plan has been completed
                    if (this.currentStage >= (this.stages.length - 1)){
                        this.$emit('navigate-to', "End");
                        return 0;
                    } else {
                        this.currentStage += 1;
                        this.currentQuestion = 0;
                    }
                }
                // if the new question does not have a targetOperation, queue this function again
                if (!this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion].hasOwnProperty("targetOperation")){
                    this.queueNextQuestion();
                }
            },
            // Updates the value stored in the progress array to reflect how many questions are left in the stage
            // Called after incrementing the index and/or stage and after adding any additional questions that need to be added
            // Since it is called after incrementing the index or stage, it needs to look back one stage if the index is 0 and the stage isn't 0
            updateProgress(){
                if (this.currentStage != 0 && this.currentQuestion == 0) {
                    // if a new stage has just been started, we need to update the progress on the last stage to 100%
                    this.progress[this.currentStage - 1] = 1;
                    // we also need to update the progress on the current stage to 0 to account for the case where
                    // a user is brought back to review from test, in which progress for review needs to be cleared
                    this.progress[this.currentStage] = 0;
                } else {
                    // otherwise, figure out how many actual questions (not just prompts) have been answered
                    // and how many are yet to be answered
                    var currentLessonPlan = this.lessonPlan[this.stages[this.currentStage]];
                    var past = currentLessonPlan.slice(0,this.currentQuestion);
                    var future = currentLessonPlan.slice(this.currentQuestion, currentLessonPlan.length);
                    // make sure to only look at actual questions
                    var numPast = past.filter(elem => elem.hasOwnProperty("targetOperation")).length;
                    var numFuture = future.filter(elem => elem.hasOwnProperty("targetOperation")).length;
                    // update progress
                    this.progress[this.currentStage] = numPast/(numPast + numFuture);
                }

            },
            // adds a question to the current stage at the specified index
            // question is an object with a targetOperation string and a prompt string, and index is a number
            addQuestion(question, index){
                this.lessonPlan[this.stages[this.currentStage]].splice(index, 0, question);
            },
            generateLessonPlan(){
                // generate intro
                // mostly prompts without questions, some questions to allow user to familiarise themselves with the
                // relationship between button presses and functions
                // An incorrect answer will not add additional questions or change the current question index
                // Since they will always have a prompt with a question, the user will stay on a question until they get it correct
                var randomRule = Math.floor(Math.random() * this.configObject.rules.length);
                this.lessonPlan.Introduction = [
                    {
                        prompt: "You will be shown which button to press",
                    },
                    {
                        prompt: "For example, to activate " + this.configObject.rules[randomRule].operationName + ", " + this.configObject.rules[randomRule].prompt.toLowerCase(),
                    },
                    {
                        prompt: "Try it now: " + this.configObject.rules[randomRule].prompt,
                        targetOperation: this.configObject.rules[randomRule].operationName,
                    },
                    {
                        prompt: "? means remember what to press",
                    },
                    {
                        prompt: "Try it now: ?",
                        targetOperation: this.configObject.rules[randomRule].operationName,
                    },
                    {
                        prompt: "You got it!",
                    },
                    {
                        prompt: "There are " + this.configObject.rules.length + " functions to learn",
                    },
                    {
                        prompt: "Press and release the buttons for each function"
                    },
                    {
                        prompt: "Let's practice the functions"
                    }
                ];
                // generate practice
                // front loaded by question pairs that contain a prompt for how to activate the function,
                // and then a question on the same function without a prompt
                // if the user gets a prompted question wrong, they remain on the same question and an extra unprompted question is added to the plan
                // if the user gets an unprompted question wrong, a prompted question is inserted at the current index, and an an extra unprompted question is added to the plan
                var randomPractice = [];
                for (let i = 0; i < this.configObject.rules.length; i++){
                    this.lessonPlan.Practice.push(
                        {prompt: this.configObject.rules[i].prompt,
                        targetOperation: this.configObject.rules[i].operationName}
                    )
                    this.lessonPlan.Practice.push(
                        {prompt: "?",
                        targetOperation: this.configObject.rules[i].operationName}
                    )
                    for (let j = 0; j < this.configObject.rules[i].practiceCount; j++) {
                        randomPractice.push(
                            {prompt: "?",
                            targetOperation: this.configObject.rules[i].operationName}
                        )
                    }
                }
                randomPractice = this.shuffle(randomPractice);
                this.lessonPlan.Practice = this.lessonPlan.Practice.concat(randomPractice);
                // generate review
                // review is short and is just the front part of practice (pairs of question with prompt and same question without prompt)
                this.lessonPlan.Review.push({
                    prompt: "Now we will review all of the functions"
                });
                for (let i = 0; i < this.configObject.rules.length; i++){
                    this.lessonPlan.Review.push({
                        prompt: this.configObject.rules[i].prompt,
                        targetOperation: this.configObject.rules[i].operationName
                    });
                    this.lessonPlan.Review.push({
                        prompt: "?",
                        targetOperation: this.configObject.rules[i].operationName
                    });
                }
                // generate test
                // no prompts after the first one, random order
                this.lessonPlan.Test.push({
                    prompt: "Now we will test you. Answering incorrectly will bring you back to the review stage."
                });
                var testStage = [];
                for (let i = 0; i < this.configObject.rules.length; i++) {
                    for (let j = 0; j < this.configObject.rules[i].testCount; j++) {
                        testStage.push({
                            prompt: "?",
                            targetOperation: this.configObject.rules[i].operationName
                        })
                    }
                }
                // shuffle it
                testStage = this.shuffle(testStage);
                this.lessonPlan.Test = this.lessonPlan.Test.concat(testStage);
            },
            setOutcome(val){
                this.outcome = val;
                // if the user is progressing so rapidly that there is still a resetting timeout
                // by the time they have answered the next question, clear the timeout to prevent
                // the next outcome being removed too quickly
                if (this.timeout != null){
                    window.clearTimeout(this.timeout);
                }
                this.timeout = window.setTimeout(() => {
                    this.outcome = null
                }, 1500);
            },
            // single point for queueing next question
            // for changing the timeout in a single place
            queueNextQuestion(){
                var question = this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion];
                // do a check first to make sure that something hasn't called this function while
                // waiting for the user to answer
                if (question && !question.hasOwnProperty("targetOperation")){
                    window.setTimeout(this.nextQuestion.bind(this), 3000);
                }
            },
            operated(event){
                // Make sure there is an active question waiting for a response before trying to
                // figure out whether the response is correct
                var question = this.lessonPlan[this.stages[this.currentStage]][this.currentQuestion];
                if (question && question.hasOwnProperty("targetOperation")){
                    if (event.detail.valid && event.detail.activeOperations.includes(question.targetOperation)){
                        // answer is correct
                        this.setOutcome("Correct!");
                        // in all stages, this will mean progressing to the next question
                        this.nextQuestion();
                        this.updateProgress();
                    } else {
                        // answer is incorrect
                        this.setOutcome("Incorrect!");
                        // if in the intro stage,
                        // An incorrect answer will not add additional questions or change the current question index
                        // Since they will always have a prompt with a question, the user will stay on a question until they get it correct
                        if (this.currentStage == 0) {
                            ;
                        }
                        // if in the practice stage,
                        // if the user gets a prompted question wrong, they remain on the same question and an extra unprompted question is added to the plan
                        // if the user gets an unprompted question wrong, a prompted question is inserted at the current index, and an an extra unprompted question is added to the plan
                        else if (this.currentStage == 1) {
                            if (question.prompt == "?"){
                                // if there is no prompt, we need to figure out what an actually useful prompt would be
                                // since practice is front loaded with questions that have prompts, we can grab the prompt
                                // of the first question with a matching targetOperation
                                var usefulPrompt = this.configObject.rules.filter(elem => elem.operationName == question.targetOperation)[0].prompt;
                                this.addQuestion({
                                    prompt: usefulPrompt,
                                    targetOperation: question.targetOperation
                                }, this.currentQuestion);
                            }
                            // find a random index between the current spot and the end of the stage
                            var randomIndex = Math.round(Math.random() * (this.lessonPlan[this.stages[this.currentStage]].length - this.currentQuestion)) + this.currentQuestion;
                            this.addQuestion({
                                prompt: "?",
                                targetOperation: question.targetOperation
                            }, randomIndex);
                            this.updateProgress();
                        }
                        // if in the review stage
                        // if it's a prompted question, remain on the same question
                        // if it's an unprompted question, decrement currentQuestion and update progress
                        // decrementing current question relies on the current structure of the review stage
                        // which is question with prompt followed by same question without a promt
                        else if (this.currentStage == 2) {
                            if (question.prompt == "?"){
                                this.currentQuestion -= 1;
                                this.updateProgress();
                            }
                        }
                        // if it's in the test stage
                        // change the first prompt in review to indicate that a failure has occurred and the review stage is being started again
                        // change the index, then update progress (to update the progress of the test stage)
                        // then change the stage, then update progress again
                        else if (this.currentStage == 3) {
                            this.lessonPlan.Review[0] = {
                                prompt: "You got one wrong! Let's review again"
                            };
                            this.currentQuestion = 0;
                            this.updateProgress();
                            this.currentStage = 2;
                            this.updateProgress();
                            this.queueNextQuestion();
                        }
                    }
                }
            },
        },
        mounted() {
            this.engine = new chordEngine.ChordEngine(this.configObject.buttons);
            window.addEventListener("operated", this.operated)
            this.engine.addRule(this.configObject.rules);
            this.generateLessonPlan();
            this.queueNextQuestion();
        },
    }
</script>

<style scoped>

.lessonGrid {
    display: grid;
    grid-template-rows: 1fr 3fr 1fr;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-items: center;
}

.header {
    grid-column: 2/3;
    grid-row: 1/2;
}

.controller {
    grid-column: 1/2;
    grid-row: 2/3;
    grid-template-rows: 4fr 1fr;
}

.prompt {
    grid-column: 2/3;
    grid-row: 2/3;
}

.function {
    grid-column: 3/4;
    grid-row: 2/3;
    display: grid;
    grid-template-rows: 1fr 1fr 1fr;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-items: center;
}

.outcome {
    grid-row: 1/2;
    font-weight: bold;
    font-size: 20px;
}

.targetOperation {
    grid-row: 2/3;
}

.functionLabel {
    grid-row: 3/4;
}

.progress {
    grid-column: 1/4;
    grid-row: 3/4;
    display: flex;
    flex-direction: row;
}


</style>