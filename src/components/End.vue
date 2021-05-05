<template>
    <div class="main">
        Congratulations, you have passed the training!<br>
        Total time taken: {{(statistics.timeTaken/1000).toFixed(2)}} seconds<br>
        Least common error: {{statistics.leastCommonError ? statistics.leastCommonError : "No errors!"}}<br>
        Most common error: {{statistics.mostCommonError ? statistics.mostCommonError : "No errors!"}}<br>
        Number of times the test stage was failed: {{statistics.testFailedNum}}<br>
        Average time taken to respond correctly: {{(statistics.averageResponseTimeCorrect/1000).toFixed(2)}} seconds<br>
        Average time taken to respond incorrectly: {{statistics.averageResponseTimeIncorrect ? (statistics.averageResponseTimeIncorrect/1000).toFixed(2) + " seconds" : "No errors!"}}<br>
        Average build time (correct answers): {{(statistics.averageBuildTimeCorrect/1000).toFixed(2)}} seconds<br>
        Average build time (incorrect answers): {{statistics.averageBuildTimeIncorrect ? (statistics.averageBuildTimeIncorrect/1000).toFixed(2) + " seconds" : "No errors!"}}<br>
        Average dwell time (correct answers): {{(statistics.averageDwellTimeCorrect/1000).toFixed(2)}} seconds<br>
        Average dwell time (incorrect answers): {{statistics.averageDwellTimeIncorrect ? (statistics.averageDwellTimeIncorrect/1000).toFixed(2) + " seconds" : "No errors!"}}
    </div>
</template>

<script>
    export default {
        props: ["statistics"]
    }
</script>