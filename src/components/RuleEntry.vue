<template>
<div>
    <q-list dense bordered padding class="rounded-borders">
        <q-item v-for="chord in sequence" :key="chord" clickable v-ripple>
          <q-item-section>
            {{chord}}
          </q-item-section>
        </q-item>
      </q-list>
      <q-input v-model="chord" type="number" label="Chord value" />
      <q-btn color="primary" label="Add chord to sequence" @click="addChord" />
    <q-input v-model="fn" label="Name of function" />
    <q-btn color="primary" label="Add rule" @click="addRule" />
</div>
</template>


<script>
    export default {
        data() {
            return {
                fn: null,
                sequence: [],
                chord: null,
            }
        },
        methods: {
            addRule(){
                if(this.sequence && this.fn){
                    this.$emit('add-rule', {
                        sequence: this.sequence,
                        fn: this.fn
                    })
                    this.fn = null;
                    this.sequence = [];
                }
            },
            addChord() {
                this.sequence.push(this.chord);
                this.chord = null;
            }
        }
    }
</script>