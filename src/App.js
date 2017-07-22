import React, { Component } from 'react';
import './css/Second.css';
import './css/Minute.css';
import './css/Hour.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      tracking: false,
      startTime: new Date().getTime(),
      endTime: null,
      trackedTime: null,
      numberOfSeconds: 5,
      numberOfMinutes: 1,
      numberOfHours: 1,
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
        numberOfSeconds: Math.floor((new Date().getTime() - this.state.startTime)/1000),
        numberOfMinutes: Math.floor((new Date().getTime() - this.state.startTime)/60000),
        numberOfHours: Math.floor((new Date().getTime() - this.state.startTime)/3600000),
      });
    }
  }

  render() {
    // https://stackoverflow.com/a/20066663/
    const seconds = Array.apply(null, {length: this.state.numberOfSeconds}).map(Number.call, Number)
    const secondsArray = seconds.map((entry,index) => {
      return <Second key={index} />
    });
    const minutes = Array.apply(null, {length: this.state.numberOfMinutes}).map(Number.call, Number)
    const minutesArray = seconds.map((entry,index) => {
      return <Minute key={index} />
    });
    const hours = Array.apply(null, {length: this.state.numberOfHours}).map(Number.call, Number)
    const hoursArray = seconds.map((entry,index) => {
      return <Hour key={index} />
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
    const minuteHeight = 10;
    return (
      <div className="Minute" style={{height:minuteHeight+ "px"}}>
      </div>
    );
  }
}

class Hour extends Component {
  render() {
    const hourHeight = 50;
    return (
      <div className="Hour" style={{height:hourHeight+ "px"}} >
      </div>
    );
  }
}

export default App;
