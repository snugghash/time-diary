import React, { Component } from 'react';
import './css/Second.css';
import './css/Minute.css';
import './css/Hour.css';


class App extends Component {
  constructor() {
    super();
    // Copy values from localStorage
    let inLocalStorage = function(variable, defaultValue) {
      if(window.localStorage.getItem(variable) === null) {
        window.localStorage[variable] = JSON.stringify(defaultValue);
        return defaultValue;
      }
      else return JSON.parse(window.localStorage[variable]);
    };

    // Prevent error upon passing null to jsonArrToCsv
    inLocalStorage("entries", []);

    this.exportData();

    this.state = {
      tracking: true,
      startTime: inLocalStorage("startTime", new Date().getTime()),
      endTime: null,
      trackedTime: null,
    };

    this.uponSlicingTime = this.uponSlicingTime.bind(this);
  }

  getInitialState() {
    console.log("TODO get intial state from localStorage");
  }

  componentDidMount() {
    this.timer = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick() {
    if(this.state.tracking) {
      this.setState({
        numberOfSeconds: Math.floor((new Date().getTime() - this.state.startTime)/1000)%60,
        numberOfMinutes: Math.floor((new Date().getTime() - this.state.startTime)/60000)%60,
        numberOfHours: Math.floor((new Date().getTime() - this.state.startTime)/3600000),
        trackedTime: new Date().getTime() - this.state.startTime,
      });
    }
  }

  uponSlicingTime(endTime) {
    let startTime = this.state.startTime;
    console.log("Sliced at " + new Date(endTime).toLocaleString() + " from " + new Date(startTime).toLocaleString());
    // Ask user for description of the time slice.
    let description = prompt("Journal entry for the time slice from " + new Date(startTime).toLocaleString() + " until " + new Date(endTime).toLocaleString());
    if (description === null) {
      return;
    } else {
      // Sanitize description
      description = description.replace(/"/g, '\x22');
    }
    this.storeEntry(startTime, endTime, '"' + description + '"', this.getTags(description));
    startTime = new Date(endTime);
    this.setState({startTime: startTime.getTime()});
    window.localStorage["startTime"] = startTime.getTime();
    window.localStorage["startTimeString"] = startTime.toLocaleString();
    this.exportData();
  };

  render() {
    // https://stackoverflow.com/a/20066663/
    const seconds = Array.apply(null, {length: this.state.numberOfSeconds}).map(Number.call, Number)
    const secondsArray = seconds.map((entry,index) => {
      return <Second key={index} time={this.state.startTime + 3600000*this.state.numberOfHours + 60000*this.state.numberOfMinutes + 1000*(this.state.numberOfSeconds - index)} onSlice={this.uponSlicingTime}/>
    });
    const minutes = Array.apply(null, {length: this.state.numberOfMinutes}).map(Number.call, Number)
    const minutesArray = minutes.map((entry,index) => {
      return <Minute key={index} time={this.state.startTime + 3600000*this.state.numberOfHours + 60000*(this.state.numberOfMinutes - index)} onSlice={this.uponSlicingTime} />
    });
    const hours = Array.apply(null, {length: this.state.numberOfHours}).map(Number.call, Number)
    const hoursArray = hours.map((entry,index) => {
      return <Hour key={index} time={this.state.startTime + 3600000*(this.state.numberOfHours-index)} onSlice={this.uponSlicingTime}/>
    });
    return (
      // https://stackoverflow.com/a/37379388
      <div>
        {secondsArray}
        {minutesArray}
        {hoursArray}
      </div>
    );
  }

  /**
   * Store given time slice data into localStorage
   */
  storeEntry = function (startTime, endTime, description, tags) {
    let entries = [];
    if(window.localStorage.getItem("entries") === null) {
      ;
    }
    else {
      entries = JSON.parse(window.localStorage["entries"]);
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

  /**
   * Parse the tags out from the text description, rn just words ending with ';' 
   * or starting with '#'. TODO NLP, reuse snugghash/ephemeron perhaps
   */
  getTags = function (description) {
    let endTags = description.split(" ").filter(function (word) {
      return word.slice(-1) === ";";
    }).map(function (word) {
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

  /* Gets us a well-formatted CSV file from a JSON array, with each object separated by newline, and each key omitted (values are used in fields of a row).
   * Credits: https://stackoverflow.com/questions/8847766/how-to-convert-json-to-csv-format-and-store-in-a-variable#8924856
   */
  jsonArrToCsv = function (array) {
    let str = "";
    for(let i=0; i < array.length; i++) {
      let line = '';
      for (var index in array[i]) {
        if (line !== '')
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
  exportData = function () {
    let trackedData = this.jsonArrToCsv(JSON.parse(localStorage.getItem("entries")));
    var blob = new Blob([trackedData], {type: "text/csv"});
    var url = URL.createObjectURL(blob);
    var a = document.querySelector("#export-data"); // id of the <a> element to render the download link
    a.href = url;
    a.download = "timeDiaryData.csv";
  }
}


class Second extends Component {
  render() {
    let secondHeight = 1;
    return (
      <div className="Second" style={{height:secondHeight + "px"}} onDoubleClick={this.props.onSlice.bind(null,this.props.time)}>
      </div>
    );
  }
}


class Minute extends Component {
  constructor() {
    super();
    this.state = {
      split: false,
    };
  }

  render() {
    const minuteHeight = 20;
    const minuteEle = (
      <div style={{position: "relative"}}>
      <div className="Minute" style={{height:minuteHeight+ "px"}} onDoubleClick={this.props.onSlice.bind(null, this.props.time)}>
        {new Date(this.props.time).toLocaleString()}
      </div>
        <div className="Split" style={{position:"absolute", top:"0", left:"0", width:"33%", "fontSize":"0.75em", backgroundColor:"#08f"}}
      onClick={() => {this.setState(
        prevState => ({split: !prevState.split}));
      }}>
          Split
        </div>
      </div>
    );
    if(this.state.split === true) {
      const seconds = Array.apply(null, {length: 60}).map(Number.call, Number)
      const secondsArray = seconds.map((entry,index) => {
        return <Second key={index} time={this.props.time - 1000*(index)} onSlice={this.props.onSlice}/>
      });
      return (
        <div>
        {minuteEle}
        <div style={{width:"50%", margin:"0 auto"}}>
          {secondsArray}
        </div>
        </div>
      );
    }
    else {
      return minuteEle;
    }
  }
}


class Hour extends Component {
  constructor() {
    super();
    this.state = {
      split: false,
    };
  }
  render() {
    const hourHeight = 50;
    const hourEle = (
      <div style={{position: "relative"}}>
        <div className="Hour" style={{height:hourHeight+ "px"}} onDoubleClick={this.props.onSlice.bind(null, this.props.time)}>
        {new Date(this.props.time).toLocaleString()}
        </div>
        <div className="Split" style={{position:"absolute", top:"0", left:"0", width:"33%", "fontSize":"0.75em", backgroundColor:"#08f"}}
      onClick={() => {this.setState(
        prevState => ({split: !prevState.split}));
      }}>
          Split
        </div>
      </div>
    );
    if(this.state.split === true) {
      const minutes = Array.apply(null, {length: 60}).map(Number.call, Number)
      const array = minutes.map((entry,index) => {
        return <Minute key={index} time={this.props.time - 60000*(index)} onSlice={this.props.onSlice}/>
      });
      return (
        <div>
        {hourEle}
        <div style={{width:"50%", margin:"0 auto"}}>
          {array}
        </div>
        </div>
      );
    }
    else {
      return hourEle;
    }
  }
}

export default App;
