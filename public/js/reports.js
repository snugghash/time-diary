/*
if (Modernizr.localstorage) {
  // window.localStorage is available!
} else {
  // no native support for HTML5 storage :(
  // maybe try dojox.storage or a third-party solution
}


let timedTags = null;
if(window.localStorage.getItem("tagTimes") === null) {
    ;
}
else {
  timedTags = JSON.parse(window.localStorage["tagTimes"]);
}

let chart = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "width": timedTags.length*10,
  "height": 200,
  "padding": 5,
  "autosize": "pad",
  "data": [
    {
      "name": "Tag times",
      "values": timedTags,
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
    { "orient": "left", "scale": "yscale", "title": "Time (ms)" }
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

vega.embed('#chart', chart);
*/

// TODO Numbers for tags don't work. tagTimes.indexOf(2) gives -1 even if 2 was in tagTimes.
// Current workaround is to chnage entries to not have those.
function getTimesForTags(startTime, endTime) {
  let tagsArrayTmp = [];
  let tagTimes = [];
  let entries = JSON.parse(window.localStorage["entries"]);
  entries.forEach( (entry) => {
    if(entry.endTime >  startTime && entry.startTime < endTime) {
      entry.tags.forEach( (tag) => {
        if(tagsArrayTmp.includes(tag)) {
          tagTimes[tagsArrayTmp.indexOf(tag)].time += entry.endTime - entry.startTime;
        }
        else {
          tagsArrayTmp.push(tag);
          tagTimes.push({
            tag: tag,
            time: entry.endTime - entry.startTime
          });
        }
      });
    }
  });
  return tagTimes;
}
//timedTagsLast7Days = timedTags;
let currentTime = new Date().getTime();
timedTagsLast24Hours = getTimesForTags(currentTime - 1000*60*60*24, currentTime);
console.log(timedTagsLast24Hours);

let chartLast24Hours = {
  "$schema": "https://vega.github.io/schema/vega/v3.0.json",
  "width": timedTagsLast24Hours.length*10,
  "height": 200,
  "padding": 5,
  "autosize": "pad",
  "data": [
    {
      "name": "Tag times",
      "values": timedTagsLast24Hours,
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
    { "orient": "left", "scale": "yscale", "title": "Time (ms)" }
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


//vega.embed('#chartLast7Days', chartLast7Days);
vega.embed('#chartLast24Hours', chartLast24Hours);
