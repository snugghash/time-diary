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
    let seconds = new Array(this.state.numberOfSeconds);
    let secondsArray = [
    <Second />,
    <Second />,
    <Second />,
    ];
    return (
      // https://stackoverflow.com/a/37379388
      <div>
        {seconds.map((entry,index) => {
          return <Second key={index}/>
        })}
        <Second key={1}/>
        <Second key={2}/>
        <Second key={3}/>
        {secondsArray}
      </div>
    );
  }
}

class Second extends Component {
  render() {
    const secondHeight = 25;
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
