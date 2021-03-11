class ChordEngine {
    // constructs an instance of the chord engine and sets all of the required fields
    // chords is an array of {key: String, chordValue: int}
    // does not listen for events, event listener must be set up externally to use keyUp and keyDown public functions defined here
    constructor(chords) {
        this._currentState = 0;
        this.activeOperations = [];
        this._rules = [];
        this._history = [];
        this._chords = chords;
        this._debounce = false;
        window.addEventListener("keydown", this.keyDown.bind(this));
        window.addEventListener("keyup", this.keyUp.bind(this));
    }

    // public function addRule
    // add a rule to the chord engine
    // rule is an object of the form {sequence: [int], operationName: string}
    // or an array of this object
    // mutates rules
    // requires self as param
    addRule(self, rule){
        if (Array.isArray(rule)){
            // array of rules, iterate and recurse
            for (let i = 0; i < rule.length; i++){
                self.addRule(self, rule[i]);
            }
        } else {
            // single rule
            self._rules.push(rule);
        }
    }

    // public function: keyDown
    // handle the pressing of a key
    // mutates current state
    keyDown(event){
        var self = this;
        // check the chords to see if this is a relevant key
        var index = self._chords.findIndex(x => x.key == event.key);
        if (index != -1) {
            // get the chord value of the key
            var keyChordValue = self._chords[index].chordValue;
            // calculate a new chord state by adding the chord value of the key
            var newState = self._currentState | keyChordValue;
            // if the chord state is different
            if (self._currentState != newState){
                // update the current state
                self._currentState = newState;
                // immediately update the history
                self._updateHistory.bind(self)();
            }
        }
    }

    // public function keyUp
    // handle the release of a key
    // debounce is currently 100ms
    // mutates current state
    keyUp(event){
        var self = this;
        // check the chords to see if this is a relevant key
        var index = self._chords.findIndex(x => x.key == event.key);
        if (index != -1) {
            // get the chord value of the key
            var keyChordValue = self._chords[index].chordValue;
            // calculate a new chord state by subtracting the chord value of the key
            var newState = self._currentState & (~keyChordValue)
            // if the chord state is different
            if (self._currentState != newState){
                // update the current state
                self._currentState = newState;
                // if debounce has not been set, set it now and queue the update history function
                if (!self._debounce){
                    self._debounce = true;
                    window.setTimeout(self._updateHistory.bind(self), 100);
                }
            }
        }
    }

    // private function updateHistory
    // resets the debounce bool
    // adds the current state to the history stack
    // used by both keyUp (with debounce) and keyDown (without debounce)
    // mutates history
    _updateHistory(){
        var self = this;
        self._debounce = false;
        self._history.push({
            state: self._currentState,
            time: Date.now()
          });
        self._ruleCheck(this);
    }

    // private function ruleCheck
    // detects whether the current history is a match for any of the defined rules
    // result is stored in activeOperations
    // null if the current history stack is a prefix of a sequence in rules
    // operationName if the current history stack is an exact match of a sequence in rules
    // 'invalid' if the current history stack is not a prefix of a sequence in rules
    // 'invalid' outcome will also discard the history stack
    // mutates history and activeOperations
    _ruleCheck(self){
        var operatedEvent = new Event('operated');
        // only proceed if the history hasn't been fully discarded
        if (self._history.length > 0){
            // extract the sequences from the rules array
            var sequences = self._rules.map(elem => elem.sequence);
            // extract the chord states from the history
            // NOTE: this discards the timestamp, which will need to be taken into account when timing is implemented
            var stack = self._history.map(elem => elem.state);
            // whether or not the history is invalid
            var invalid = true;
            var matchIndicies = [];
            // for each of the sequences extracted from rules, and while history is not empty
            // exist immediately on match
            // on prefix, mard as valid but keep looking for match
            for (let i = 0; i < sequences.length && self._history.length > 0; i++){
                // compare the history stack to the current sequence being examined
                // arrayCompare will return either 'nomatch', 'match', 'break' or 'prefix'
                var comparison = self._resolve(stack, sequences[i]);
                if (comparison == 'match') {
                    // match has been found, add operationName to activeOperations
                    matchIndicies.push(i);
                    invalid = false;
                } else if (comparison == 'prefix'){
                    invalid = false;
                } else if (comparison == 'break'){
                    self._history = [];
                    invalid = false;
                }
            }
            if (invalid){
                self.activeOperations = [];
                self._history = [];
                // also dispatch event here to let the trainer know you answered incorrectly
                window.dispatchEvent(operatedEvent);
            } else if (matchIndicies.length > 0){
                for (let i = 0; i < matchIndicies.length; i++){
                    self.activeOperations.push(self._rules[i].operationName);
                    // reset history for the next command
                    self._history = [];
                    window.dispatchEvent(operatedEvent);
                }
            } else {
                // history stack is a prefix of at least 1 rule
                // discard operations, keep history, don't dispatch event
                self.activeOperations = [];
            }
        }
    }

    // private function arrayCompare
    // checks whether two arrays are equal,
    // or the first is a prefix of the second
    // returns a string, one of
    // 'nomatch' 'match' or 'prefix'
    // does not mutate
    _resolve(history, sequence){
        if (history.length > sequence.length){
            // if history is longer than the sequence, it can't be
            // either a prefix or exact match
            // relies on history being discarded when it doesn't match anything
            return 'nomatch';
        }
        if (history.length == 1 && history[0] == 0){
            // this is a major break after a hold function
            return 'break';
        }
        for (let i = 0; i < history.length; i++){
            // make sure the history exactly matched the sequence for as long as the history is
            // includeTest will be true if the history includes all of the bits specified by the include field
            var includeTest = (history[i] & sequence[i].include) == sequence[i].include;
            // excludeTest will be truthy if there are any bits in the history that are in the exclude field
            var excludeTest = history[i] & sequence[i].exclude;
            // we can conclude there is no match if excludeTest is false or includeTest is not true
            if (!includeTest || excludeTest){
                return 'nomatch';
            }
        }
        if (history.length == sequence.length){
            // if the length of the history is the length of the rule,
            // and no inconsistency has been found, it is an exact match
            return 'match';
        } else if (history.length < sequence.length){
            // if the history is shorter and no inconsistency has been found, it is a prefix
            return 'prefix'
        } else {
            // this part of the code should be inaccessible due to the logical impossiblity of its
            // preconditions, but I'm including it in case something goes wrong
            return 'error'
        }
    }
}

export { ChordEngine }