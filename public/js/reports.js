// TODO UX for choosing arbitrary time, maybe like chrone dev tools > perfprmance > time selector. Using average text UX for now.
// Or some weird log-scaled version for allowing days and months on the same element.
// Maybe only months are necessary to be selected this way - last 7 days and last day adequate for short time scales.



if (Modernizr.localstorage) {
  // window.localStorage is available!
} else {
  // no native support for HTML5 storage :(
  // maybe try dojox.storage or a third-party solution
}



// TODO remove storage for timedTags in localStorage
let currentTime = new Date().getTime();
timedTagsAllTime = getTimesForTags(0, currentTime)
console.log(timedTagsAllTime);

let chart = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "width": timedTagsAllTime.length*10,
  "height": 200,
  "padding": 5,
  "autosize": "pad",
  "data": [
    {
      "name": "Tag times",
      "values": timedTagsAllTime,
    }
  ],
  "scales": [
    {
      "name": "xscale",
      "type": "band",
      "domain": {"data": "Tag times", "field": "tag"},
      "range": {"step": 60},
      "padding": 0.05,
      "round": true
    },
    {
      "name": "yscale",
      "domain": {"data": "Tag times", "field": "time"},
      "nice": true,
      "range": "height"
    }
  ],
  "axes": [
    { "orient": "bottom", "scale": "xscale", "title": "Tags" },
    { "orient": "left", "scale": "yscale", "title": "Time (h)" }
  ],
  "marks": [
    {
      "type": "rect",
      "from": {"data":"Tag times"},
      "encode": {
        "enter": {
          "x": {"scale": "xscale", "field": "tag"},
          "width": {"scale": "xscale", "band": 1},
          "y": {"scale": "yscale", "field": "time"},
          "y2": {"scale": "yscale", "value": 0}
        },
        "update": {
          "fill": {"value": "steelblue"}
        },
        "hover": {
          "fill": {"value": "red"}
        }
      }
    },
    {
      "type": "text",
      "encode": {
        "enter": {
          "align": {"value": "center"},
          "baseline": {"value": "bottom"},
          "fill": {"value": "#333"}
        },
        "update": {
          "x": {"scale": "xscale", "signal": "tooltip.tag", "band": 0.5},
          "y": {"scale": "yscale", "signal": "tooltip.time", "offset": -2},
          "text": {"signal": "tooltip.time"},
          "fillOpacity": [
            {"test": "datum === tooltip", "value": 0},
            {"value": 1}
          ]
        }
      }
    },
  ],
  "signals": [
    {
      "name": "tooltip",
      "value": {},
      "on": [
        {"events": "rect:mouseover", "update": "datum"},
        {"events": "rect:mouseout",  "update": "{}"}
      ]
    }
  ],
}

vega.embed('#chartAllTime', chart);




timedTagsLast24Hours = getTimesForTags(currentTime - 1000*60*60*24, currentTime);
let chartLast24Hours = chart;
chartLast24Hours.width = timedTagsLast24Hours.length*10;
chartLast24Hours.data[0].values = timedTagsLast24Hours;
vega.embed('#chartLast24Hours', chartLast24Hours);

timedTagsLast7Days = getTimesForTags(currentTime - 1000*60*60*24*7, currentTime);
let chartLast7Days = chart;
chartLast24Hours.width = timedTagsLast7Days.length*10;
chartLast24Hours.data[0].values = timedTagsLast7Days;
vega.embed('#chartLast7Days', chartLast7Days);



// https://stackoverflow.com/a/14950153/
(function(window, document, undefined){
  window.onload = init;
  function init(){
    let tmp = document.getElementById("updateChartButton");
    tmp.addEventListener('click', getTimesAndUpdateChart);
  }
})(window, document, undefined);

function getArbitStartAndEndTimes() {
  let arbitTimes = {};
  arbitTimes.start = new Date(document.getElementById("arbitStartTime").value);
  arbitTimes.end = new Date(document.getElementById("arbitEndTime").value);
  console.log("start", arbitTimes.start.toLocaleString(), arbitTimes.end.toLocaleString());
  return arbitTimes;
}

function getTimesAndUpdateChart() {
  const arbitTimes = getArbitStartAndEndTimes();
  timedTagsArbit = getTimesForTags(arbitTimes.start, arbitTimes.end);
  let chartArbitTime = chart;
  chartArbitTime.width = timedTagsArbit.length*10;
  chartArbitTime.data[0].values = timedTagsArbit;
  vega.embed('#chartArbitTime', chartArbitTime);
}



// TODO Numbers for tags don't work. tagTimes.indexOf("2") gives -1 even if 2 was in tagTimes.
// Current workaround is to chnage entries to not have those.
function getTimesForTags(startTime, endTime) {
  let tagsArrayTmp = [];
  let tagTimes = [];
  let entries = JSON.parse(window.localStorage["entries"]);
  entries.forEach( (entry) => {
    if(entry.endTime >  startTime && entry.startTime < endTime) {
      entry.tags = getTags(entry.description)
      entry.tags.forEach( (tag) => {
        const countedTime = (entry.endTime - entry.startTime)/1000/60/60;
        if(tagsArrayTmp.includes(tag)) {
          tagTimes[tagsArrayTmp.indexOf(tag)].time += countedTime;
        }
        else {
          tagsArrayTmp.push(tag);
          tagTimes.push({
            tag: tag,
            time: countedTime
          });
        }
      });
    }
  });
  console.log(tagTimes);
  return tagTimes.sort((a,b) => {
    return b.time - a.time
  });
}



/**
 * Parse the tags out from the text description, rn just words ending with ';'
 * or starting with '#'. TODO NLP, reuse snugghash/ephemeron perhaps
 * TODO combine the both this and fn from App.js into utilities
 */
function getTags(description) {
  let endTags = description.split(" ").filter(function (word) {
    return word.slice(-1) === ";";
  }).map(function (word) {
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
