class QuestionGenerator {
    constructor(config) {
        this.config = config;
        // tracks whether to provide a hint or not in the case of
        // question segments which alternate between hint and no hint
        this.giveHint = true;
        // tracks which question we are up to in the case of presenting
        // all questions in order rather than randomised 
        this.questionIndex = 0;
    }

    questionFromStage(stage){
        if (["Introduction", "Practice", "Review"].includes(stage)){
            return this.alternatingQuestions(stage)
        } else {
            return this.randomQuestionFromStage(stage);
        }
    }

    getQuestionWithHint(question){
        var questionIndex = this.config.findIndex(x => x.operationName == question.operationName);
        return {
            operationName: this.config[questionIndex].operationName,
            hint: this.config[questionIndex].hint,
        }
    }

    // uses both giveHint and questionIndex
    // to provide an ordered list of questions with
    // each hinted question being followed by a non
    // hinted question
    alternatingQuestions(stage){
        var rtn = {
            operationName: null,
            hint: "?"
        };
        if (this.questionIndex >= this.config.length){
            return this.randomQuestionFromStage(stage);
        }
        rtn.operationName = this.config[this.questionIndex].operationName;
        if (this.giveHint){
            rtn.hint = this.config[this.questionIndex].hint;
        } else {
            this.questionIndex += 1;
        }
        this.giveHint = !this.giveHint;
        return rtn;
    }

    toggleHintState(){
        this.giveHint = !this.giveHint;
    }

    setQuestionIndex(num){
        this.questionIndex = num;
    }

    randomQuestionFromStage(stage){
        var questions = this.config.filter(x => x[stage] > 0);
        if (questions.length > 0){
            var randomIndex = Math.floor(Math.random() * questions.length);
            var rtn = {
                operationName: questions[randomIndex].operationName,
                hint: "?",
                nextStage: false,
            };
            var questionIndex = this.config.findIndex(x => x.operationName == questions[randomIndex].operationName);
            this.config[questionIndex][stage] -= 1;
            if (questions.length == 1 && this.config[questionIndex][stage] == 0){
                rtn.nextStage = true;
            }
            return rtn;
        } else {
            return -1;
        }
    }

    addQuestionsToStage(stage, question, num){
        var questionIndex = this.config.findIndex(x => x.operationName == question.operationName);
        this.config[questionIndex][stage] += num;
    }
}

export { QuestionGenerator }