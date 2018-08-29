import React, { Component } from 'react';
let utilities = require('./utilities');

class DotaMatchTimes extends Component {
  constructor() {
      super();

    this.state = {
      playerId: 140554334,
    };

    this.getDotaMatchTimes = this.getDotaMatchTimes.bind(this);
  }

  render() {
    return (
      <div>
        <input type="text" id="playerId" name="playerId" value={this.state.playerId} onChange={this.handleChange} />
        <button onClick={this.getDotaMatchTimes}> Fetch dota data </button>
      </div>
    );
  }

  handleChange (e) {
    this.setState({[e.target.name]: e.target.value});
  };

  /**
   * Depends on state.playerId
   * (int} numberOfMatches
   */
  async getDotaMatchTimes() {
    let allMatches = await fetch("https://api.opendota.com/api/players/" + this.state.playerId + "/matches",  /*+ "?limit=10000"*/ {
      method:"GET",
      mode: "cors",
    });
    let allMatchesJson = await allMatches.json();
    console.log("All matches json ", allMatchesJson);
    allMatchesJson.forEach(element => {
      ;// utilities.storeEntry(element.startTime, element.startTime + element.duration*1000, element.match_id.toString(), ['dota']);
    });
  }
}

export default DotaMatchTimes;