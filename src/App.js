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
    const seconds = new Array(this.state.numberOfSeconds);
    const secondsArray = seconds.map((entry,index) => {
      console.log("w");
      return <Second key={index}/>
    });
    console.log(seconds);
    return (
      // https://stackoverflow.com/a/37379388
      <div>
        <Second key={1} number={this.state.numberOfSeconds}/>
        <Second key={2}/>
        <Second key={3}/>
        {secondsArray}
      </div>
    );
  }
}

class Second extends Component {
  render() {
    let secondHeight = 25 * this.props.number;
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
