<template>
<div class="app">
  <welcome v-if="currentPage == 'Welcome'" @navigate-to="navigateTo" :content="packager.content"/>
  <familiarisation v-else-if="currentPage == 'Familiarisation'" @navigate-to="navigateTo" :configObject="configObject"/>
  <lesson v-else-if="currentPage == 'Lesson'" @navigate-to="navigateTo" :configObject="configObject" />
  <waterfall v-else-if="currentPage == 'Waterfall'" :configObject="configObject" />
  <end v-else-if="currentPage == 'End'" />
</div>
</template>

<script>
import Welcome from 'src/components/Welcome.vue'
import Familiarisation from 'src/components/Familiarisation.vue'
import Lesson from 'src/components/Lesson.vue'
import Waterfall from 'src/components/Waterfall.vue'

import { logo1, logo2 } from '../assets/images.json'
import End from 'src/components/End.vue'

export default {
  components: { Welcome, Familiarisation, Lesson, Waterfall, End },
  name: 'MainLayout',
  data () {
    return {
      // This is how the config object might look if/when this engine ever gets used
      // configObject: {
      //   deviceName: "W2",
      //   buttons: [
      //     {x:1, y:1, key: " ", label: "A", chordValue: 1, width: 60, height: 60, activeColour: 'green', inactiveColour: 'white'}, 
      //     {x:2, y:1, key: "j", label: "1", chordValue: 2, width: 60, height: 60, activeColour: 'green', inactiveColour: 'white'},
      //     {x:2, y:3, key: "l", label: "2", chordValue: 8, width: 60, height: 60, activeColour: 'green', inactiveColour: 'white'},
      //     {x:2, y:2, key: "k", label: "3", chordValue: 4, width: 60, height: 60, activeColour: 'green', inactiveColour: 'white'},
      //     {x:2, y:4, key: ";", label: "A", chordValue: 16, width: 60, height: 60, activeColour: 'green', inactiveColour: 'white'},
      //   ],
      //   rules: [
      //     {sequence: [{include: 1, exclude: 0}, {include: 0, exclude: 32}], operationName: "PTT", prompt: "Press and release the Spacebar.", introCount: 2, practiceCount: 3, reviewCount: 2, testCount: 2 },
      //     {sequence: [{include: 4, exclude: 0}, {include: 0, exclude: 32}, {include: 4, exclude: 0}, {include: 0, exclude: 32}], operationName: "CoupletDemo", prompt: "Press the K key, then release all keys, then press the K key again.", introCount: 2, practiceCount: 3, reviewCount: 2, testCount: 2 },
      //   ],
      // },
      // this is how the config object looks when chords are passed over rather than button press values
      // basically buttons contains no logic, just styling stuff for the shadow pad
      // rules is a lot simpler
      configObject: {
        buttons: [
          {width: 60, height: 60, x:1, y:1, switchLocation: 1, label: "A", activeColour: 'green', inactiveColour: 'white'}, 
          {width: 60, height: 60, x:2, y:1, switchLocation: 2, label: "1", activeColour: 'green', inactiveColour: 'white'},
          {width: 60, height: 60, x:2, y:2, switchLocation: 4, label: "2", activeColour: 'green', inactiveColour: 'white'},
          {width: 60, height: 60, x:2, y:3, switchLocation: 8, label: "3", activeColour: 'green', inactiveColour: 'white'},
          {width: 60, height: 60, x:3, y:1, switchLocation: 32, label: "A", activeColour: 'green', inactiveColour: 'white'},
        ],
        rules: [
          {operationName: "PTT", maxChord: 4, prompt: "Press button 2.", practiceCount: 3, testCount: 2 },
          {operationName: "Volume", maxChord: 8, prompt: "Press button 3.", practiceCount: 3, testCount: 2 },
          {operationName: "Range", maxChord: 3, prompt: "Press button A and button 1.", practiceCount: 3, testCount: 2 },
          {operationName: "Aim", maxChord: 2, prompt: "Press button 1", practiceCount: 3, testCount: 2 },
          {operationName: "Zoom", maxChord: 5, prompt: "Press button A and button 2.", practiceCount: 3, testCount: 2 },
          {operationName: "Black/White", maxChord: 9, prompt: "Press button A and button 3.", practiceCount: 3, testCount: 2 },
        ]
      },
      currentPage: "Welcome",
      title: "Training App",
      logo1: null,
      logo2: null,
    }
  },
  methods: {
    navigateTo(target) {
      this.currentPage = target;
    },
  },
  computed: {
    packager(){
      return {
        content: {
          logo1: this.logo1,
          title: this.title,
          logo2: this.logo2,
        },
      }
    }
  },
  mounted(){
    this.logo1 = logo1;
    this.logo2 = logo2;
    // window.addEventListener("keypress", this.keyPress);
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

.app {
  width: 100vw;
  height: 100vh;
}

.main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

</style>