(function(window, document, undefined){
  window.onload = init;
  function init(){
    var peer = new Peer();
    peer.on('open', function(id) {
      console.log('My peer ID is: ' + id);
    })
  }
})(window, document, undefined);


