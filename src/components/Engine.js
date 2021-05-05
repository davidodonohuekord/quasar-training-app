class Engine {
    // config it both buttons and rules
    // mode is "keyboard" or "other"
    constructor(config, mode) {
        this.mode = mode;
        // these variables are required to deregister the event handlers when binding context
        this.keyDownFunction = this.keyDown.bind(this);
        this.keyUpFunction = this.keyUp.bind(this);
        window.addEventListener("keydown", this.keyDownFunction);
        if (mode == "keyboard"){
            window.addEventListener("keyup", this.keyUpFunction);
        }
        this.debounceMS = 250;
        this.timeoutMS = 2000;
        this.timeout = null;
        this.currentChordState = 0;
        this.currentKeyboardKeys = [];
        this.history = [];
        this.config = config;
        this.debounce = false;
    }

    delete(){
        window.removeEventListener("keydown", this.keyDownFunction);
        if (this.mode == "keyboard"){
            window.removeEventListener("keyup", this.keyUpFunction);
        }
    }

    // only used in keyboard mode
    keyUp(event){
        var index = this.config.buttons.findIndex(x => x.keyboardLocation == event.key);
        if (index != -1) {
            var keyChordValue = this.config.buttons[index].chordValue;
            var newState = this.currentChordState & (~keyChordValue)
            if (this.currentChordState != newState){
                var keyIndex = this.currentKeyboardKeys.findIndex(x => x.chordValue == keyChordValue);
                this.currentKeyboardKeys.splice(keyIndex, 1);
                window.dispatchEvent(new CustomEvent('stateChange', {"detail": {
                    buttons: this.currentKeyboardKeys,
                }}));
                this.currentChordState = newState;
                if (!this.debounce){
                    this.debounce = true;
                    window.setTimeout(this.updateHistory.bind(this), this.debounceMS);
                }
            }
        }
    }

    keyDown(event){
        if (this.mode == "keyboard"){
            var index = this.config.buttons.findIndex(x => x.keyboardLocation == event.key);
            if (index != -1) {
                var keyChordValue = this.config.buttons[index].chordValue;
                var newState = this.currentChordState | keyChordValue;
                if (this.currentChordState != newState){
                    this.currentKeyboardKeys.push(keyChordValue);
                    window.dispatchEvent(new CustomEvent('stateChange', {"detail": {
                        buttons: this.currentKeyboardKeys,
                    }}));
                    this.currentChordState = newState;
                    if (!this.debounce){
                        this.debounce = true;
                        window.setTimeout(this.updateHistory.bind(this), this.debounceMS);
                    }
                }
            }
        } else { // not keyboard mode
            var state = event.key.charCodeAt(0) - 97;
            var buttons = [];
            if (!(state == 0 && this.currentChordState == 0)){
                for (let i = 0; i < this.config.buttons.length; i++){
                    if (this.config.buttons[i].chordValue & state) {
                        buttons.push(this.config.buttons[i].chordValue)
                    }
                }
                window.dispatchEvent(new CustomEvent('stateChange', {"detail": {
                    buttons,
                }}));
                this.currentChordState = state;
                this.updateHistory();
            }
        }
    }

    updateHistory(){
        this.debounce = false;
        this.history.push({
            state: this.currentChordState,
            time: Date.now()
        });
        this.ruleCheck();
    }

    ruleCheck(){
        if (this.history.length == 1 && this.history[0].state == 0) {
            this.history = [];
            this.activeOperation = null;
            window.dispatchEvent(new CustomEvent('break'));
        }
        // only proceed if the history hasn't been fully discarded
        else if (this.history.length > 0){
            // extract the sequences from the rules array
            var sequences = this.config.rules.map(elem => elem.sequence);
            // extract the chord states from the history
            // NOTE: this discards the timestamp, which will need to be taken into account when timing is implemented
            var stack = this.history.map(elem => elem.state);
            // whether or not the history is invalid
            var invalid = true;
            // for each of the sequences extracted from rules
            // exit immediately on match
            // on prefix, mark as valid but keep looking for match
            for (let i = 0; i < sequences.length; i++){
                // compare the history stack to the current sequence being examined
                // arrayCompare will return either 'nomatch', 'match', or 'prefix'
                var comparison = this.resolve(stack, sequences[i]);
                if (comparison == 'match') {
                    // match has been found
                    var activeOperation = this.config.rules[i].operationName;
                    invalid = false;
                    this.history = [];
                    window.dispatchEvent(new CustomEvent('operated', {"detail": {
                        valid: true,
                        activeOperation
                    }}));
                    return 0;
                } else if (comparison == 'prefix'){
                    invalid = false;
                }
            }
            if (invalid){
                this.history = [];
                // also dispatch event here to let the trainer know you answered incorrectly
                window.dispatchEvent(new CustomEvent('operated', {"detail": {
                    valid: false,
                }}));
            }
        }
    }

    resolve(history, sequence){
        if (history.length > sequence.length){
            // if history is longer than the sequence, it can't be
            // either a prefix or exact match
            // relies on history being discarded when it doesn't match anything
            return 'nomatch';
        }
        for (let i = 0; i < history.length; i++){
            // make sure the history exactly matched the sequence for as long as the history is
            // includeTest will be true if the history includes all of the bits specified by the include field
            // var includeTest = (history[i] & sequence[i]) == sequence[i];
            // excludeTest will be truthy if there are any bits in the history that are in the exclude field
            // var excludeTest = history[i] & sequence[i].exclude;
            // we can conclude there is no match if excludeTest is false or includeTest is not true
            if (!(history[i] == sequence[i])){
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

export { Engine }