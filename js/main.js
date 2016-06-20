if (Modernizr.localstorage) {
  // window.localStorage is available!
} else {
  // no native support for HTML5 storage :(
  // maybe try dojox.storage or a third-party solution
}
var s = Snap("#timeSVG");
var bigCircle = s.circle(150, 150, 100);
bigCircle.click(function(f) {
    bigCircle.attr({fill:"#ccc"});
    window.localStorage["startTime"] = new Date().getTime();
    window.localStorage["startTimeString"] = new Date().toLocaleString();

    s.text(100,100, window.localStorage["startTimeString"]);
});
