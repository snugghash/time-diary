if (Modernizr.localstorage) {
    // window.localStorage is available!
} else {
    // no native support for HTML5 storage :(
    // maybe try dojox.storage or a third-party solution
}
let s = Snap("#timeSVG");
let bigCircle = s.circle(150, 150, 100);
bigCircle.click(function(f) {
    bigCircle.attr({fill:"#ccc"});
    window.localStorage["startTime"] = new Date().getTime();
    window.localStorage["startTimeString"] = new Date().toLocaleString();
    bigCircle.animate({r:25},100);
    let textStartDisplay = s.text(250,150, window.localStorage["startTimeString"]);
    var moveDownGroup = s.group(textStartDisplay);
    function shiftDown() {
      oldPosition = parseInt(textStartDisplay.attr('y')) + 50;
      var smallCircle = s.circle(150,oldPosition,25);
      moveDownGroup = s.group(textStartDisplay,s.circle(150,oldPosition,25));
      textStartDisplay.animate({y:oldPosition},100);
    }
    setInterval(shiftDown,1000);

});

