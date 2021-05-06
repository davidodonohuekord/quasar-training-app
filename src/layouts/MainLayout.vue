<template>
<div class="app">
  <welcome v-if="currentPage == 'Welcome'" @navigate-to="navigateTo" :content="packager.content"/>
  <familiarisation v-else-if="currentPage == 'Familiarisation'" @navigate-to="navigateTo" :configObject="configObject"/>
  <lesson v-else-if="currentPage == 'Lesson'" @navigate-to="navigateTo" @report="report" :configObject="configObject" />
  <waterfall v-else-if="currentPage == 'Waterfall'" :configObject="configObject" />
  <end v-else-if="currentPage == 'End'" :statistics="statistics" />
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
      configObject: {
        buttons: [
          {x:1, y:1, chordValue: 1, keyboardLocation: " ", label: "A"}, 
          {x:2, y:1, chordValue: 2, keyboardLocation: "j", label: "1"},
          {x:2, y:2, chordValue: 4, keyboardLocation: "k", label: "2"},
          {x:2, y:3, chordValue: 8, keyboardLocation: "l", label: "3"},
          {x:3, y:1, chordValue: 32, keyboardLocation: ";", label: "A"},
        ],
        rules: [
          {operationName: "PTT", sequence: [4], hint: "Press and hold button 2.", Practice: 3, Review: 0, Test: 2},
          {operationName: "Volume", sequence: [8, 0], hint: "Press button 3 and then release all buttons.", Practice: 3, Review: 0, Test: 2 },
          {operationName: "Range", sequence: [3], hint: "Press and hold button A and button 1.", Practice: 3, Review: 0, Test: 2 },
          {operationName: "Aim", sequence: [2], hint: "Press and hold button 1", Practice: 3, Review: 0, Test: 2 },
          {operationName: "Zoom", sequence: [5], hint: "Press and hold button A and button 2.", Practice: 3, Review: 0, Test: 2 },
          {operationName: "Black/White", sequence: [9, 0], hint: "Press button A and button 3, and then release all buttons", Practice: 3, Review: 0, Test: 2 },
        ]
      },
      currentPage: "Welcome",
      title: "Training App",
      logo1: null,
      logo2: null,
      // statistics gets populated by the report event from lesson
      statistics: null
    }
  },
  methods: {
    navigateTo(target) {
      this.currentPage = target;
    },
    report(stats){
      this.statistics = stats;
    }
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