let isTracking = (function() {
  if(window.localStorage.getItem("isTracking") === null) {
    window.localStorage["isTracking"] = JSON.stringify(false);
    return false;
  }
  else return JSON.parse(window.localStorage["isTracking"]);
})();



/* Gets us a well-formatted CSV file from a JSON array, with each object separated by newline, and each key omitted (values are used in fields of a row).
 * TODO breaks+removes all the quotes. Need to check old data(5) for that edit.
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


$('#searchButton').on('click', function() {
  if(window.localStorage.getItem("entries") === null) {
    return
  }
  else {
    entries = JSON.parse(window.localStorage["entries"]);
  }
  searchTerms = $("#searchString").val().split();
  for(let i = 0; i < entries.length; i++){
    for(let j=0; j<searchTerms.length; j++) {
      if(entries[i].description.indexOf(searchTerms[j]) != -1) {
        console.log("found");
        $("#searchResult").append(`<div> ${entries[i].description} <br/> ${entries[i+1].description}</div>`);
      }
    }
  }
});


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
      let maximum_time = 0; //JSON.parse(window.localStorage["startTime"]); // Prolly causes error if null TODO
      for(let j=0; j < jsonArr.length - 1; j++) {
        let exists = false;
        temp = {
          startTime: parseInt(jsonArr[j][0]),
          endTime: parseInt(jsonArr[j][1]),
          description: jsonArr[j][2],
          tags: jsonArr[j].slice(3)
        };
        if(temp.endTime > maximum_time) {
          maximum_time = temp.endTime;
        }
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
              console.log("Same time slice but different description; entry index", k, ", merged description is:", entries[k].description);
            }
          }
        }
        if(exists == false)
          entries.push(temp);
      }
      current_max_time = window.localStorage["startTime"] // BUG will fail if there's no start time, and it's likely to be used in that case too. TODO reuse the retrieve_or_storeDefault_in_localStorage after refactor
      maxTimeConfirm = prompt((new Date(current_max_time)).toLocaleString() + " is new startTime => press 1, for " + (new Date(maximum_time)).toLocaleString() + " press  0, anything else to quit.");
      if (maxTimeConfirm == "1") {
        maximum_time = current_max_time
      }
      else if (maxTimeConfirm == "0") {
        maximum_time = maximum_time
      }
      else {
        return
      }
      console.log("final max time", maximum_time);
      window.localStorage["startTime"] = JSON.stringify(maximum_time);
      window.localStorage["startTimeString"] = maximum_time.toLocaleString();
      entries = [...new Set(entries)];
      console.log(entries);
      importConfirm = prompt("Check log output, import? true/false");
      if (importConfirm == "true") {
        console.log("Imported!");
        window.localStorage["entries"] = JSON.stringify(entries);
      }
      else {
        console.log("Cancelled import");
      }
    };
    r.readAsText(file);
  }
});
