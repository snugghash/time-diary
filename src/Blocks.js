import React, { Component } from 'react';



class Blocks extends Component {
  constructor() {
    super();

    this.state = {
      split: false,
      desc: "",
    };

    this.uponSlicingTime = this.uponSlicingTime.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onHoverOver = this.onHoverOver.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.exportData();
  }



  /*
  TODO Think about className and possible ways to be dynamic with it.
  */
  render() {
    return (
      <input type="text" name="desc" onChange={this.handleChange} value={this.state.desc}/>
      <div
        className="Second"
        style={{height:getHeight() + "em", backgroundColor:this.props.color}}
        onClick={this.props.onSelect.bind(null, this.props.time)}
        onMouseOver={this.props.onHoverOver.bind(null, this.props.time)}>
      </div>
    )
  }



  handleChange (e) {
    this.setState({[e.target.name]: e.target.value});
    this.props.onChange(e.target.value); // Send the new description to overwrite the found entry's description.
  };



  getHeight(sizeOfTime) {
    if(sizeOfTime == 1) {
      return 0.1
    }
    else if (sizeOfTime == 60) {
      return 2
    }
    else if (sizeOfTime == 3600) {
      return 5
    }
  }
}


export default Actions
