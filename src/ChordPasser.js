class ChordPasser {
    constructor() {
        this.maxChord = 0;
        window.addEventListener("keydown", this.keyDown.bind(this));
    }

    keyDown(event){
        var num = event.keyCode - 65;
        if (event.key == 'a') {
            // break
            if (this.maxChord) { // needed because RIC sends 2 a keys on break
                window.dispatchEvent(new CustomEvent('break', {"detail": {
                    maxChord: this.maxChord,
                }}));
                this.maxChord = 0;
            }
        } else {
            if (num == -49){
                // second A button
                num = 1;
            }
            this.maxChord = this.maxChord | num;
        }
    }
}

export { ChordPasser }