import React, { Component } from 'react';
let utilities = require('./utilities');

class DotaMatchTimes extends Component {
  constructor() {
      super();

    this.state = {
      playerId: 140554334,
      limit: 10,
    };

    this.getDotaMatchTimes = this.getDotaMatchTimes.bind(this);
  }

  render() {
    return (
      <div>
        <input type="text" id="playerId" name="playerId" value={this.state.playerId} onChange={this.handleChange} />
        <button onClick={this.getDotaMatchTimes}> Add last 10 dota games for this player ID </button>
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
    let allMatches = await fetch("https://api.opendota.com/api/players/" + this.state.playerId + "/matches?limit=" + this.state.limit, {
      method:"GET",
      mode: "cors",
    });
    let allMatchesJson = await allMatches.json();
    console.log("All matches json ", allMatchesJson);
    allMatchesJson.forEach(element => {
      utilities.storeEntry(element.start_time*1000, element.start_time*1000 + (Number(element.duration) * 1000), "\"dota; game; " + element.match_id.toString() + "\"", ['dota', 'game']);
    });
  }
}

export default DotaMatchTimes;
