class ChordPasser {
    constructor() {
        this.maxChord = 0;
        this.buildStart = null;
        this.lastChange = null;
        window.addEventListener("keydown", this.keyDown.bind(this));
    }

    keyDown(event){
        var num = event.keyCode - 65;
        if (event.key == 'a') {
            // break
            if (this.maxChord) { // needed because RIC sends 2 a keys on break
                var now = new Date();
                var buildTime = now - this.buildStart;
                var dwellTime = now - this.lastChange;
                window.dispatchEvent(new CustomEvent('break', {"detail": {
                    maxChord: this.maxChord,
                    buildTime,
                    dwellTime
                }}));
                this.maxChord = 0;
                this.buildStart = null;
            }
        } else {
            if (num == -49){
                // second A button
                num = 1;
            }
            if (!this.buildStart) {
                this.buildStart = new Date();
            }
            this.lastChange = new Date();
            this.maxChord = this.maxChord | num;
        }
    }
}

export { ChordPasser }