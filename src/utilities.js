/**
 * Parse the tags out from the text description, rn just words ending with ';'
 * or starting with '#'. TODO NLP, reuse snugghash/ephemeron perhaps
 * TODO combine the both this and fn from App.js into utilities
 * TODO code between the two has diverged
 */
function getTags(description) {
  const removeEdgeDoubleQuotes = function(description) {
    let newDesc = description;
    if(description.slice(0,1) == "\"") {
      newDesc = newDesc.slice(1);
    }
    if(description.slice(-1) == "\"") {
      newDesc = newDesc.slice(0,-1);
    }
    return newDesc;
  }
  description = removeEdgeDoubleQuotes(description);
  let endTags = description.split(" ").filter(function (word) {
    return word.slice(-1) === ";";
  }).map(function (word) {
    // TODO should we remove this?
    if(word[0] == '"') {
      return word.slice(1,-1);
    }
    return word.slice(0, -1);
  });
  let startTags = description.split(" ").filter(function (word) {
    return word.charAt(0) === "#";
  }).map(function (word) {
    return word.slice(1);
  });
  // console.log(new Set([...endTags], [...startTags])); // TODO convert to test
  return [...new Set([...endTags], [...startTags])]
};



/**
 * Store given time slice data into localStorage
 */
function storeEntry(startTime, endTime, description, tags) {
  let entries = [];
  if(window.localStorage.getItem("entries") === null) {
    ;
  }
  else {
    entries = JSON.parse(window.localStorage["entries"]);
  }
  // Unsustainable, maybe make it do it in reverse chronological order.
  // TODO sort and bin search for stat time
  let doNotAddFlag = 0;
  entries.some(element => {
    if(element.startTime == startTime && element.endTime == endTime && element.description == description) {
      doNotAddFlag = 1;
      return true;
    }
    return false;
  });
  // TODO Bad code
  if(doNotAddFlag == 1) {
    return;
  }

  entries.push({startTime, endTime, description, tags});
  window.localStorage["entries"] = JSON.stringify(entries);

  // Collect all tags into a localStorage array.
  let tagsList = [
    'Games',
    'Organizing',
    'Work',
    'Play',
    'Distracted',
    'Break',
    'Timetracking'
  ];
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
  // console.log("All tags:", tagsList);
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



module.exports = {
  getTags,
  storeEntry,
}
