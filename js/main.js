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

/**
 * Store given time slice data into localStorage
 */
let storeEntry = function (startTime, endTime, description, tags) {
  // TODO remove unnecessary row number
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

  // Collect all tags into a localStorage array.
  let tagsList = ["Games", "Organizing"];
  if(window.localStorage.getItem("tagList") === null) {
    ;
  }
  else {
    tagsList.push(JSON.parse(window.localStorage["tagsList"]));
  }
  tagsList = new Set(tagsList);
  tags.forEach( (item) => {
    tagsList.add(item);
  });
  tagsList = Array.from(tagsList);
  console.log("All tags:", tagsList);
  window.localStorage["tagsList"] = JSON.stringify(tagsList);

  // Add to times for each tag
  let tagTimes = []
  if(window.localStorage.getItem("tagTimes") === null) {
    ;
  }
  else {
    tagTimes = JSON.parse(window.localStorage["tagTimes"]);
  }
  tags.forEach( (item) => {
    if(item in tagTimes)
      tagTimes[tagTimes.indexOf(item)].time += endTime - startTime;
    else
      tagTimes.push({
        tag: item,
        time: endTime - startTime
      });
  });
  window.localStorage["tagTimes"] = JSON.stringify(tagTimes);
};

/**
 * Parse the tags out from the text description, rn just stuff ending with ';' or starting with '#'
 */
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
    // Increase size of SVG element to accommodate new objects
    timeSVG.height(timeSVG.height() + secondHeight);
    //If objects are out of sync with current time, draw them all at once.
    // let i = (parseInt(s.node.style.height)-350)/50 - (parseInt(textStartDisplay.attr('y'))-150)/50;
    /*while (i>0) {
      console.log("Not synced");
      appendElement();
      i--;
    }*/
  }
  function appendElement() {
    newPosition = parseInt(textStartDisplay.attr('y')) + secondHeight;
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
      exportData();
    };
    let smallCircle = s.circle(150, newPosition, secondHeight/2);
    // Move down old objects
    moveDownGroup = moveDownGroup.add(smallCircle,smallRect);
    textStartDisplay.animate({y:newPosition},100);
  }
  updateTimeStepCaller = setInterval(updateTimeStep,1000);
});


/* Gets us a well-formatted CSV file from a JSON array, with each object separated by newline, and each key omitted (values are used in fields of a row).
 * Credits: https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable#8924856
 */
let jsonArrToCsv = function (array) {
  let str = "";
  for(let i=0; i < array.length; i++) {
    let line = '';
    for (var index in array[i]) {
      if (line != '')
        line += ',';
      line += array[i][index];
    }
    str += line + '\r\n';
  }
  return str;
}

/* Modifies a link's href to point to a CSV file with journal entries generated from a JSON array (TODO perhaps doing this on demand, perhaps storing and appending to the final CSV in localStorage along with the JSON array would be better, performance-wise), to be viewed/saved by the user.
 * Credits: https://stackoverflow.com/questions/16428835/save-data-from-localstorage-to-csv#16430518
 */
let exportData = function () {
  let trackedData = jsonArrToCsv(JSON.parse(localStorage.getItem("entries")));
  var blob = new Blob([trackedData], {type: "text/csv"});
  var url = URL.createObjectURL(blob);
  var a = document.querySelector("#export-data"); // id of the <a> element to render the download link
  a.href = url;
  a.download = "timeDiaryData.csv";
}
