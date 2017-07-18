import React, { Component } from 'react';
import './css/Second.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      tracking: false,
      startTime: null,
      endTime: null,
      trackedTime: null,
      numberOfSeconds: 5,
      numberOfMinutes: null,
      numberOfHours: null,
      numberOfDays: null,
      numberOfMonths: null,
      numberOfYears: null
    };
  }
  render() {
    // https://stackoverflow.com/a/20066663/
    const seconds = Array.apply(null, {length: this.state.numberOfSeconds}).map(Number.call, Number)
    const secondsArray = seconds.map((entry,index) => {
      return <Second key={index}/>
    });
    return (
      // https://stackoverflow.com/a/37379388
      <div>
        {secondsArray}
      </div>
    );
  }
}

class Second extends Component {
  render() {
    let secondHeight = 25;
    return (
      <div className="Second" style={{height:secondHeight + "px"}}>
      </div>
    );
  }
}

class Minute extends Component {
  render() {
    const minuteHeight = 50;
    return (
      <div className="Minute" style={{height:minuteHeight+ "px"}}>
      </div>
    );
  }
}

class Hour extends Component {
  render() {
    const hourHeight = 100;
    return (
      <div className="Hour" style={{height:hourHeight+ "px"}} >
      </div>
    );
  }
}

export default App;
