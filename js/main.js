if (Modernizr.localstorage) {
    // window.localStorage is available!
} else {
    // no native support for HTML5 storage :(
    // maybe try dojox.storage or a third-party solution
}
let s = Snap("#timeSVG");
let bigCircle = s.circle(150, 150, 100);
let isTracking = (function() {
    if(window.localStorage.getItem("isTracking") === null) {
        window.localStorage["isTracking"] = JSON.stringify(false);
        return false; 
    }
    else return JSON.parse(window.localStorage["isTracking"]);
})(); 
var textStartDisplay, moveDownGroup;
body.onload = function() {
    
}

bigCircle.click(function(f) {
    if(isTracking==true) {
        isTracking=false;
        clearInterval();
        return;
    }
    else isTracking=true;
    bigCircle.attr({fill:"#ccc"});
    window.localStorage["startTime"] = new Date().getTime();
    window.localStorage["startTimeString"] = new Date().toLocaleString();
    bigCircle.animate({r:25},100);
    textStartDisplay = s.text(250,150, window.localStorage["startTimeString"]);
    moveDownGroup = s.group(textStartDisplay);
    function shiftDown() {
        // Increase size of SVG element to accomodate new objects
        s.node.style.height = parseInt(s.node.style.height)+50;
        newPosition = parseInt(textStartDisplay.attr('y')) + 50;
        // Draw new objects
        let smallCircle = s.circle(150,newPosition,25);
        // Move down old objects
        moveDownGroup = moveDownGroup.add(smallCircle);
        textStartDisplay.animate({y:newPosition},100);
    }
    setInterval(shiftDown,1000);
});

