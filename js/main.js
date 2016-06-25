if (Modernizr.localstorage) {
    // window.localStorage is available!
} else {
    // no native support for HTML5 storage :(
    // maybe try dojox.storage or a third-party solution
}
let s = Snap("#timeSVG");
let bigCircle = s.circle(150, 150, 100);
var isTracking = false;
var isTracking = (function() {
    if(window.localStorage["isTracking"] === null) {
        alert(JSON.stringify(false));
        window.localStorage["isTracking"] = JSON.stringify(false);
        alert("wololo");
        return false; 
    }
    else return window.localStorage["isTracking"];
})();
alert(isTracking);
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
    let textStartDisplay = s.text(250,150, window.localStorage["startTimeString"]);
    var moveDownGroup = s.group(textStartDisplay);
    function shiftDown() {
        // increase sive of SVG element to accomodate new objects
        s.node.style.height = parseInt(s.node.style.height)+50;
        newPosition = parseInt(textStartDisplay.attr('y')) + 50;
        // Draw new objects
        var smallCircle = s.circle(150,newPosition,25);
        // Move down old objects
        moveDownGroup = s.group(textStartDisplay,s.circle(150,newPosition,25));
        textStartDisplay.animate({y:newPosition},100);
    }
    setInterval(shiftDown,1000);

});
window.onpageshow = function() {
    alert("page show");
}
window.onpagehide = function() {
    alert("page hidden");
}
