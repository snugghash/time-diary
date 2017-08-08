if (Modernizr.localstorage) {
  // window.localStorage is available!
} else {
  // no native support for HTML5 storage :(
  // maybe try dojox.storage or a third-party solution
}
//let s = Snap("#timeSVG");
//let timeSVG = $('#timeSVG');

const secondHeight = 10;
const minuteHeight = 20;
const hourHeight = 50;
const dayHeight = 100;

//let bigCircle = s.circle(150, 150, dayHeight); // TODO fix in beta, starting and ending UX to be better
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

let bigCircleOnClick = function(f) {
  if(isTracking==true) {
    isTracking=false;
    window.localStorage["isTracking"] = JSON.stringify(false);
    clearInterval(updateTimeStepCaller);
    window.localStorage["endTime"] = new Date().getTime();
    window.localStorage["endTimeString"] = new Date().toLocaleString();
    let textEndDisplay = s.text(250,150,window.localStorage["endTimeString"]);
    return;
  }
  isTracking=true;
  window.localStorage["isTracking"] = JSON.stringify(true);
  bigCircle.attr({fill:"#ccc"});
  window.localStorage["startTime"] = new Date().getTime();
  window.localStorage["startTimeString"] = new Date().toLocaleString();
  bigCircle.animate({r:dayHeight/2},100);
  textStartDisplay = s.text(250,150, window.localStorage["startTimeString"]);
  moveDownGroup = s.group(textStartDisplay);
  updateTimeStepCaller = setInterval(updateTimeStep,1000);
};

/*
 * Functions to call every time step
 */
function updateTimeStep() {
  enlargeSVG(secondHeight);
  appendElement(secondHeight);
  appendElement(secondHeight);
}

/*
 * Enlarge the SVG by the amount in the argument
 */
function enlargeSVG(deltaHeight) {
  let timeSVG = $('#timeSVG');
  // Increase size of SVG element to accommodate new objects
  timeSVG.height(timeSVG.height() + deltaHeight);
  //If objects are out of sync with current time, draw them all at once.
  // let i = (parseInt(s.node.style.height)-350)/50 - (parseInt(textStartDisplay.attr('y'))-150)/50;
  /*while (i>0) {
    console.log("Not synced");
    appendElement();
    i--;
  }*/
}

/*
 * Append a time measure to the display
 */
function appendElement(elementHeight) {
  newPosition = parseInt(textStartDisplay.attr('y')) + elementHeight;
  console.log("Append at " + newPosition);
  // Draw new objects
  let smallRect = s.rect(150-elementHeight/2, newPosition, elementHeight, elementHeight-3);
  smallRect.attr({
    fill: "#5050ff",
    opacity:"0.4",
  });
  // Listen for time slice events.
  smallRect.node.ondblclick = function(event) {
    endTime = new Date().getTime() - 1000*(event.target.attributes['y'].value - 150)/elementHeight; 
    startTime = localStorage["startTime"];
    console.log("Sliced at " + endTime + " from " + startTime);
    // Ask user for description of the time slice.
    let description = prompt("Journal entry for the time slice until " + new Date(endTime).toLocaleString());
    storeEntry(startTime, endTime, description, getTags(description));
    window.localStorage["startTime"] = new Date().getTime();
    window.localStorage["startTimeString"] = new Date().toLocaleString();
    exportData();
  };
  let smallCircle = s.circle(150, newPosition, elementHeight/2);
  // Move down old objects
  moveDownGroup = moveDownGroup.add(smallCircle, smallRect);
  textStartDisplay.animate({y:newPosition},100);
}

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


// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ),
    "gi"
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec( strData )){

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[ 1 ];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      strMatchedDelimiter !== strDelimiter
    ){

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push( [] );
    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[ 2 ]){

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[ 2 ].replace(
        new RegExp( "\"\"", "g" ),
        "\""
      );

    } else {

      // We found a non-quoted value.
      strMatchedValue = arrMatches[ 3 ];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[ arrData.length - 1 ].push( strMatchedValue );
  }

  // Return the parsed data.
  return( arrData );
}

$('#importData').on('change', function() {
  for(let i=0; i < this.files.length; i++) {
    file = this.files[i];
    var r = new FileReader();
    r.onload = function(e) {
      var contents = e.target.result;
      jsonArr = CSVToArray(contents);
      let entries = [];
      if(window.localStorage.getItem("entries") === null) {
        ;
      }
      else {
        entries = JSON.parse(window.localStorage["entries"]);
      }
      for(let j=0; j < jsonArr.length - 1; j++) {
        let exists = false;
        temp = {
          startTime: parseInt(jsonArr[j][0]),
          endTime: parseInt(jsonArr[j][1]),
          description: jsonArr[j][2],
          tags: jsonArr[j].slice(3)
        };
        for (let k=0; k < entries.length; k++) {
          if(entries[k].startTime == temp.startTime &&
             entries[k].endTime == temp.endTime) {
            exists = true;
            // Cover all possible formats in importing
            // TODO export to func, improve func to NLP
            if (entries[k].description == '"' + temp.description + '"') {
            }
            else if (entries[k].description == temp.description) {
            }
            else {
              entries[k].description = entries[k].description.slice(0,-1) +" "+ temp.description + '"';
              console.log("Same time slice, different description, finally:", entries[k].description);
            }
          }
        }
        if(exists == false)
          entries.push(temp);
      }
      entries = [...new Set(entries)];
      console.log(entries);
      importConfirm = prompt("Check log output, import? true/false");
      if (importConfirm == "true") {
        console.log("Imported!");
        window.localStorage["entries"] = JSON.stringify(entries);
      }
    };
    r.readAsText(file);
  }
});
