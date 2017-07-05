if (Modernizr.localstorage) {
  // window.localStorage is available!
} else {
  // no native support for HTML5 storage :(
  // maybe try dojox.storage or a third-party solution
}
let s = Snap("#timeSVG");
let timeSVG = $('#timeSVG');

const secondHeight = 50;
const minuteHeight = 100;
const hourHeight = 150;

let bigCircle = s.circle(150, 150, minuteHeight); // TODO fix in beta, starting and ending UX to be better
let isTracking = (function() {
  if(window.localStorage.getItem("isTracking") === null) {
    window.localStorage["isTracking"] = JSON.stringify(false);
    return false; 
  }
  else return JSON.parse(window.localStorage["isTracking"]);
})(); 
var textStartDisplay, moveDownGroup, updateTimeStepCaller;

let storeEntry = function (startTime, endTime, description, tags) {
  let rowNumber = null;
  if(window.localStorage.getItem("rowNumber") === null) {
    window.localStorage["rowNumber"] = 1;
    rowNumber = 1;
  }
  else {
    rowNumber = window.localStorage["rowNumber"] + 1;
  }
  let entries = [];
  if(window.localStorage.getItem("entries") === null) {
    ;
  }
  else {
    entries = JSON.parse(window.localStorage["entries"]);
  }
  entries.push({startTime, endTime, description, tags});
  window.localStorage["entries"] = JSON.stringify(entries);
  window.localStorage["rowNumber"] = rowNumber;
};

let getTags = function (description) {
  return description.split(" ").filter(function (word) {
    return word.slice(-1) == ";";
  }).map(function (word) {
    return word.slice(0, -1);
  });
};

bigCircle.click(function(f) {
  if(isTracking==true) {
    isTracking=false;
    window.localStorage["isTracking"] = JSON.stringify(false);
    clearInterval(updateTimeStepCaller);
    window.localStorage["endTime"] = new Date().getTime();
    window.localStorage["endTimeString"] = new Date().toLocaleString();
    let textEndDisplay = s.text(250,150,window.localStorage["endTimeString"]);
    return;
  }
  else {
    isTracking=true;
    window.localStorage["isTracking"] = JSON.stringify(true);
  }
  bigCircle.attr({fill:"#ccc"});
  window.localStorage["startTime"] = new Date().getTime();
  window.localStorage["startTimeString"] = new Date().toLocaleString();
  bigCircle.animate({r:25},100);
  textStartDisplay = s.text(250,150, window.localStorage["startTimeString"]);
  moveDownGroup = s.group(textStartDisplay);
  function updateTimeStep() {
    enlargeSVG();
    appendElement();
    appendElement();
  }
  function enlargeSVG() {
    // Increase size of SVG element to accomodate new objects
    timeSVG.height(timeSVG.height() + 50);
    //If objects are out of sync with current time, draw them all at once.
    let i = (parseInt(s.node.style.height)-350)/50 - (parseInt(textStartDisplay.attr('y'))-150)/50;
    /*while (i>0) {
      console.log("Not synced");
      appendElement();
      i--;
    }*/
  }
  function appendElement() {
    newPosition = parseInt(textStartDisplay.attr('y')) + 50;
    console.log("Append at " + newPosition);
    // Draw new objects
    let smallRect = s.rect(125, newPosition, secondHeight, secondHeight);
    smallRect.attr({
      fill: "#5050ff",
      opacity:"0.4",
    });
    // Listen for time slice events.
    smallRect.node.ondblclick = function(event){
      endTime = new Date().getTime();
      startTime = localStorage["startTime"];
      console.log("Sliced at " + event.target.attributes['y'].value + " on " + new Date().toLocaleString());
      // Ask user for description of the time slice.
      let description = prompt("Journal entry for the time slice until " + new Date().toLocaleString());
      storeEntry(startTime, endTime, description, getTags(description));
      window.localStorage["startTime"] = new Date().getTime();
      window.localStorage["startTimeString"] = new Date().toLocaleString();
    };
    let smallCircle = s.circle(150, newPosition, secondHeight/2);
    // Move down old objects
    moveDownGroup = moveDownGroup.add(smallCircle,smallRect);
    textStartDisplay.animate({y:newPosition},100);
  }
  updateTimeStepCaller = setInterval(updateTimeStep,1000);
});

