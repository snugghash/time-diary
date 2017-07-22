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

    this.state = {
      tracking: true,
      startTime: inLocalStorage("startTime", new Date().getTime()),
      endTime: null,
      trackedTime: null,
      numberOfSeconds: null,
      numberOfMinutes: null,
      numberOfHours: null,
      numberOfDays: null,
      numberOfMonths: null,
      numberOfYears: null
    };
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
        numberOfHours: Math.floor((new Date().getTime() - this.state.startTime)/3600000)%24,
        trackedTime: new Date().getTime() - this.state.startTime,
      });
    }
  }

  render() {
    // https://stackoverflow.com/a/20066663/
    const seconds = Array.apply(null, {length: this.state.numberOfSeconds}).map(Number.call, Number)
    const secondsArray = seconds.map((entry,index) => {
      return <Second key={index} time={this.state.startTime + 3600000*this.state.numberOfHours + 60000*this.state.numberOfMinutes + 1000*(this.state.numberOfSeconds - index)} />
    });
    const minutes = Array.apply(null, {length: this.state.numberOfMinutes}).map(Number.call, Number)
    const minutesArray = minutes.map((entry,index) => {
      return <Minute key={index} time={this.state.startTime + 3600000*this.state.numberOfHours + 60000*(this.state.numberOfMinutes - index)} />
    });
    const hours = Array.apply(null, {length: this.state.numberOfHours}).map(Number.call, Number)
    const hoursArray = hours.map((entry,index) => {
      return <Hour key={index} time={this.state.startTime + 3600000*(this.state.numberOfHours-index)} onclick={function() { console.log(this.props.time)} }/>
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
}


class Second extends Component {
  render() {
    let secondHeight = 1;
    return (
      <div className="Second" style={{height:secondHeight + "px"}}>
      </div>
    );
  }
}

class Minute extends Component {
  render() {
    const minuteHeight = 20;
    return (
      <div className="Minute" style={{height:minuteHeight+ "px"}}>
      {new Date(this.props.time).toLocaleString()}
      </div>
    );
  }
}

class Hour extends Component {
  render() {
    const hourHeight = 50;
    return (
      <div className="Hour" style={{height:hourHeight+ "px"}} onDoubleClick={this.props.onclick.bind(this)}>
      {new Date(this.props.time).toLocaleString()}
      </div>
    );
  }
}

export default App;
