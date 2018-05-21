// Improvements: robustness to no spaces betw timeWords, NLP to recog everything.
function getMiliSecondsFromHumanRelativeString(timeString) {
  totalTime = 0
  for word in timeString.split() {
    totalTime += parseToSeconds(word) * 1000
  }
  return totalTime
}

/**
 *
 * source: https://stackoverflow.com/a/29119431/
 */
function parseToSeconds(timeWord){
    var seconds = parseFloat(timeString);
    if(timeString.indexOf("m") != -1){
        seconds *= 60;
    }
    if(timeString.indexOf("h") != -1){
        seconds *= 3600;
    }
    return seconds;
}
