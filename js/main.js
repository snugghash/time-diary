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
var textStartDisplay, moveDownGroup, shiftDownInterval;

bigCircle.click(function(f) {
    if(isTracking==true) {
        isTracking=false;
        window.localStorage["isTracking"] = JSON.stringify(false);
        clearInterval(shiftDownInterval);
        return;
    }
    else {
        isTracking=true;
        window.localStorage["isTracking"] = JSON.stringify(true);
    }
    bigCircle.attr({fill:"#ccc"});
    window.localStorage["startTime"] = new Date().getTime();
    window.localStorage["startTimeString"] = new Date().toLocaleString();
    bigCircle.animate({r:25},100);
    textStartDisplay = s.text(250,150, window.localStorage["startTimeString"]);
    moveDownGroup = s.group(textStartDisplay);
    function shiftDown() {
        // Increase size of SVG element to accomodate new objects
        s.node.style.height = parseInt(s.node.style.height) + 50;
        newPosition = parseInt(textStartDisplay.attr('y')) + 50;
        //If objects are out of sync with current time, draw them all at once.
        if((parseInt(s.node.style.height)-350)/50 != (newPosition-200)/50) {
            console.log("Not synced");
        }

        // Draw new objects
        let smallRect = s.rect(125,newPosition,50,50);
        smallRect.attr({
            fill: "#5050ff",
            alpha: "0.1"
        });
        let smallCircle = s.circle(150,newPosition,25);
        // Move down old objects
        moveDownGroup = moveDownGroup.add(smallCircle,smallRect);
        textStartDisplay.animate({y:newPosition},100);
    }
    shiftDownInterval = setInterval(shiftDown,1000);
});

