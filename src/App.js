import React, { Component } from 'react';
import './DotaMatchTimes';
import './css/Second.css';
import './css/Minute.css';
import './css/Hour.css';
import './css/Split.css';
import DotaMatchTimes from './DotaMatchTimes';
let utilities = require('./utilities');


// TODO Add ability to view arbitrary streches, TODO perhaps as a result of search
// BUG UX pressing export with no data should raise a user-information event
// TODO export as text with dates readable by humans as well.
// BUG Selecting short time slices on seconds sometimes messes up the highlight: it still shows selection from startTime
class App extends Component {
  constructor() {
    super();

    // Prevent error upon passing null to jsonArrToCsv
    //this.retrieve_or_storeDefault_in_localStorage("entries", []);
    //window.localStorage.getItem("entries")

    this.exportData();

    this.state = {
      tracking: true,
      startTime: this.retrieve_or_storeDefault_in_localStorage("startTime", new Date().getTime()),
      endTime: null,
      trackedTime: null,
      showPastUntil: this.retrieve_or_storeDefault_in_localStorage("startTime", new Date().getTime()) - 3600000,
      selected: false,
      selectedTime1: null,
      selectedTime2: null,
    };

    this.uponSlicingTime = this.uponSlicingTime.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onHoverOver = this.onHoverOver.bind(this);
    this.storeEntry = utilities.storeEntry;
  }



  getInitialState() {
    console.log("TODO get intial state from localStorage");
  }



  componentDidMount() {
    this.timer = setInterval(
      () => {
        if(this.state.tracking) {
          this.setState(this.updateState);
        }
      },
      1000
    );
  }



  componentWillUnmount() {
    clearInterval(this.timer);
  }



  // BUG selection of time ranges might not be intuitive
  render() {
    // https://stackoverflow.com/a/20066663/
    const seconds = Array.apply(null, {length: this.state.numberOfSeconds}).map(Number.call, Number)
    const secondsArray = seconds.map((entry,index) => {
      let elementTime = this.state.startTime + 3600000*this.state.numberOfHours + 60000*this.state.numberOfMinutes + 1000*(this.state.numberOfSeconds - index);
      let color = "#aaa"
      if ((elementTime - this.state.selectedTime2) * (elementTime - this.state.selectedTime1) <= 0) {
        color = "#aae"
      }
      return <Second key={index} time={elementTime} onSlice={this.uponSlicingTime} onSelect={this.onSelect} onHoverOver={this.onHoverOver} color={color} selectedTime1={this.state.selectedTime1} selectedTime2={this.state.selectedTime2}/>
    });
    const minutes = Array.apply(null, {length: this.state.numberOfMinutes}).map(Number.call, Number)
    const minutesArray = minutes.map((entry,index) => {
      let elementTime = this.state.startTime + 3600000*this.state.numberOfHours + 60000*(this.state.numberOfMinutes - index);
      let color = "#aaa"
      if ((elementTime - this.state.selectedTime2) * (elementTime - this.state.selectedTime1) <= 0) {
        color = "#aae"
      }
      return <Minute key={index} time={elementTime} onSlice={this.uponSlicingTime} onSelect={this.onSelect} onHoverOver={this.onHoverOver} color={color} selectedTime1={this.state.selectedTime1} selectedTime2={this.state.selectedTime2}/>
    });
    const hours = Array.apply(null, {length: this.state.numberOfHours}).map(Number.call, Number)
    const hoursArray = hours.map((entry,index) => {
      let elementTime = this.state.startTime + 3600000*(this.state.numberOfHours-index);
      let color = "#aaa"
      if ((elementTime - this.state.selectedTime2) * (elementTime - this.state.selectedTime1) <= 0) {
        color = "#aae"
      }
      return <Hour key={index} time={elementTime} onSlice={this.uponSlicingTime} onSelect={this.onSelect} onHoverOver={this.onHoverOver} color={color} selectedTime1={this.state.selectedTime1} selectedTime2={this.state.selectedTime2}/>
    });
    //let entries = this.retrieve_or_storeDefault_in_localStorage("entries", null)
    let entries = JSON.parse(window.localStorage.getItem("entries"));
    let pastArray = null;
    if(entries == null) {
      pastArray = (
        <p> No entries to display </p>
      );
    }
    else {
      pastArray = entries.map((entry, index) => {
        if (entry.endTime < this.state.showPastUntil) {
          return <div key={index}/>;
        }
        else {
          return (
            <p key={index}>
            {new Date(entry.startTime).toLocaleString()} to {new Date(entry.endTime).toLocaleString()}
            <EditableTimeSlice desc={entry.description} onChange={this.editPastDesc.bind(this, index)}/>
            </p>
          );
        }
      }).reverse();
    }
    return (
      // https://stackoverflow.com/a/37379388
      <div>
      {secondsArray}
      {minutesArray}
      {hoursArray}
      <hr/>
      {new Date(this.state.startTime).toLocaleString()}
      <hr/>
      <h3>Past</h3>
      <button onClick={() => {this.setState(
        prevState => ({showPastUntil: prevState.showPastUntil + 3600000})
      );}} >Load less</button>
      <button onClick={() => {this.setState(
        prevState => {
          return {showPastUntil: prevState.showPastUntil - 3600000};
        }
      );}} >Load more</button>
      <br/>
      Or show until: <input type="text" defaultValue="YYYY-MM-DD HH:MM:SS" id="textbox-showPastUntil"/>
      <input type="button" defaultValue="Update past" onClick={(function () {
        this.setState(
            {showPastUntil: new Date(document.getElementById("textbox-showPastUntil").value)}
      )}).bind(this)}/>
      {pastArray}
      <DotaMatchTimes/>
      {/* <button onClick={() => {
        window.localStorage.clear();
      }} > CLEAR ALL DATA!!!11!! (Starts over from 0 time tracked, no confirmation) </button> */}
      </div>
    );
  }



  // Including args state and props to make it clear this is a setState function
  // which returns state
  updateState(state, props) {
    let currentTime = new Date().getTime();
    let startTime = this.retrieve_or_storeDefault_in_localStorage("startTime", new Date().getTime());
    return {
      startTime: startTime,
      numberOfSeconds: Math.floor((currentTime - startTime)/1000)%60,
      numberOfMinutes: Math.floor((currentTime - startTime)/60000)%60,
      numberOfHours: Math.floor((currentTime - startTime)/3600000),
      trackedTime: currentTime - startTime,
    }
  };



  // Called when a click occurs on any time element.
  // If already selected, find the range and slice time.
  // TODO RF to check time since startTime for sliced objects
  // BUG After doing intermediate slices the starttime becomes null.
  onSelect(selectedTime1, sizeOfBlock) {
    this.setState(
      prevState => {
        console.log("Selected time", selectedTime1);
        if(prevState.selected === false) {
          return {selected: !(prevState.selected),
            selectedTime1: selectedTime1,
          };
        }
        else {
          // Call uponSlicingTime when first and second clicks are on same
          if(prevState.selectedTime1 === selectedTime1) {
            console.log("Double click on ", selectedTime1);
            this.uponSlicingTime(selectedTime1); // TODO async
            return {selected: !(prevState.selected)}
          }
          // Get direction of time slice
          let startTime;
          let endTime;
          if(prevState.selectedTime1 > selectedTime1) {
            startTime = selectedTime1;
            endTime = prevState.selectedTime1;
          }
          else {
            startTime = prevState.selectedTime1;
            endTime = selectedTime1;
          }
          this.onArbitraryTimeSlice(startTime, endTime);
          return {
            selected: !(prevState.selected),
            selectedTime1: null,
            selectedTime2: null
          }
        }
      }
    );
  }

  // Act upon arbitrary time slices
  onArbitraryTimeSlice(startTime, endTime) {
    // We now have two times, get the full time slice and log in human readable
    console.log("Sliced at " + new Date(endTime).toLocaleString() + " from " + new Date(startTime).toLocaleString());
    // Ask user for description of the time slice.
    let description = this.getDescription(startTime, endTime);
    if (description === null)
      return;
    this.storeEntry(startTime, endTime, '"' + description + '"', this.getTags(description));
    this.exportData();
    // TODO do something about the gap in recorded time left by this.
    // Or compensate for it when making the "startTime" to ending slices.
    // Or leave it that way for overarching stuff. TOTHINK
    // Current implementation: show that slice has description,
    // but still show slice.
  }



  onHoverOver(selectedTime2) {
    if(this.state.selected) {
      console.log("Hovering over ", selectedTime2);
      this.setState({
        selectedTime2: selectedTime2,
      });
    }
    return;
  }



  /* Ask user for description of time slice, sanitize description.
   * TODO UX
   */
  getDescription(startTime, endTime) {
    let description = prompt("Journal entry for the time slice from " + new Date(startTime).toLocaleString() + " until " + new Date(endTime).toLocaleString());
    if (description === null) {
      return description;
    } else {
      // Sanitize description
      description = description.replace(/"/g, '\x22');
    }
    return description;
  }



  uponSlicingTime(endTime) {
    let startTime = this.state.startTime;
    console.log("Slicing at " + new Date(endTime).toLocaleString() + " from " + new Date(startTime).toLocaleString());
    // Ask user for description of the time slice.
    let description = this.getDescription(startTime, endTime);
    if (description === null)
      return;
    this.storeEntry(startTime, endTime, '"' + description + '"', this.getTags(description));
    startTime = new Date(endTime);
    window.localStorage["startTime"] = startTime.getTime();
    window.localStorage["startTimeString"] = startTime.toLocaleString();
    this.exportData();
  };



  /**
   * Bound function that updates the specified entry's description.
   */
  editPastDesc = function (index, newDesc) {
    //let entries = this.retrieve_or_storeDefault_in_localStorage("entries", null)
    let entries = JSON.parse(window.localStorage.getItem("entries"));
    entries[index].description = newDesc;
    window.localStorage["entries"] = JSON.stringify(entries);
    return null;
  };



  /*
   * Copy values from localStorage, if empty, store in defaultValue and return it.
   */
  retrieve_or_storeDefault_in_localStorage = function(variable, defaultValue) {
    if(window.localStorage.getItem(variable) === null) {
      window.localStorage.setItem(variable, JSON.stringify(defaultValue));
      return defaultValue;
    }
    else return JSON.parse(window.localStorage[variable]);
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
    let entries = localStorage.getItem("entries");
    if(entries == null) {
      // TODO tests
      return;
    }
    let jsonDataArray = JSON.parse(entries);
    if(jsonDataArray == null) {
      // TODO tests for stuff like this?
      return;
    }
    let trackedData = this.jsonArrToCsv(jsonDataArray);
    var blob = new Blob([trackedData], {type: "text/csv"});
    var url = URL.createObjectURL(blob);
    var a = document.querySelector("#export-data"); // id of the <a> element to render the download link
    a.href = url;
    a.download = "timeDiaryData.csv";
  }
}




class Second extends Component {
  render() {
    let secondHeight = 0.1;
    return (
      <div className="Second" style={{height:secondHeight + "em", backgroundColor:this.props.color}} onClick={this.props.onSelect.bind(null, this.props.time)} onMouseOver={this.props.onHoverOver.bind(null, this.props.time)}>
      </div>
    );
  }
}




class Split extends Component {
  render() {
    return (
      <div className="Split" onClick={this.props.onClick}>
        Split
      </div>
    );
  }
}




class EditableTimeSlice extends Component {
  constructor() {
    super();
    this.state = {
      desc: "",
    };
    this.handleChange = this.handleChange.bind(this);
  }



  componentWillMount() {
    this.setState({desc: this.props.desc});
  }



  handleChange (e) {
    this.setState({[e.target.name]: e.target.value});
    this.props.onChange(e.target.value); // Send the new description to overwrite the found entry's description.
  };



  render() {
    return (
      <input type="text" name="desc" onChange={this.handleChange} value={this.state.desc}/>
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
    const minuteHeight = 2;
    const minuteEle = (
      <div style={{position: "relative"}}>
      <div className="Minute" style={{height:minuteHeight+ "em", backgroundColor:this.props.color}} onClick={this.props.onSelect.bind(null, this.props.time)} onMouseOver={this.props.onHoverOver.bind(null, this.props.time)}>
        {new Date(this.props.time).toLocaleString()}
      </div>
        <Split
          onClick={() => {this.setState(
            prevState => ({split: !prevState.split})
          );}}
        />
      </div>
    );
    if(this.state.split === true) {
      const seconds = Array.apply(null, {length: 60}).map(Number.call, Number)
      const secondsArray = seconds.map((entry,index) => {
        let elementTime = this.props.time - 1000*(index)
        let color = "#aaa"
        if ((elementTime - this.props.selectedTime2) * (elementTime - this.props.selectedTime1) <= 0) {
          color = "#aae"
        }
        return <Second key={index} time={elementTime} onSlice={this.props.onSlice} onSelect={this.props.onSelect} onHoverOver={this.props.onHoverOver} color={color}/>
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
    const hourHeight = 5;
    const hourEle = (
      <div style={{position: "relative"}}>
        <div className="Hour" style={{height:hourHeight+ "em", backgroundColor: this.props.color}} onClick={this.props.onSelect.bind(null, this.props.time)} onMouseOver={this.props.onHoverOver.bind(null, this.props.time)}>
        {new Date(this.props.time).toLocaleString()}
        </div>
        <Split
          onClick={() => {this.setState(
            prevState => ({split: !prevState.split}));
          }}
        />
      </div>
    );
    if(this.state.split === true) {
      const minutes = Array.apply(null, {length: 60}).map(Number.call, Number)
      const array = minutes.map((entry,index) => {
        let elementTime = this.props.time - 60000*(index);
        let color = "#aaa";
        if ((elementTime - this.props.selectedTime2) * (elementTime - this.props.selectedTime1) <= 0) {
          color = "#aae"
        }
        return <Minute key={index} time={elementTime} onSlice={this.props.onSlice} onSelect={this.props.onSelect} onHoverOver={this.props.onHoverOver} color={color} selectedTime1={this.props.selectedTime1} selectedTime2={this.props.selectedTime2}/>
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
