var WebRTC = require('./wrtclib');

 //Should have properties onLocalStream, onRemoveLocalStream, onRemoteStream, onRemoveRemoteStream

  var webrtc = WebRTC({});

  client.on('new-peer', function(data){
    var id = data.id;
    var peer = webrtc.onNewPeer(id, webrtc);
    peer.start();
  });
  
  client.on('signal', function(data){
    webrtc.handlers.sig(data);
  });

  client.on('peer-disconnect', function(data){
    var id = data.id;
    webrtc.removePeers(id);
  });

  webrtc.on('message', function(message){
    client.emit('signal', message);
  });


  function create(stream){
    var elem = document.createElement('video');
    elem.autoplay = true;
    document.body.appendChild(elem);
    attachMediaStream(elem, stream);
  }
  webrtc.on('localStream', create);
  webrtc.on('peerStreamAdded', create);
  webrtc.start(null, function(err, stream){
    client.emit('join', {room:1234});
  });

module.exports = webrtc;