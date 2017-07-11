import React, { Component } from 'react';
import './css/Second.css';

class App extends Component {
  render() {
    return (
      <Second/>
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
