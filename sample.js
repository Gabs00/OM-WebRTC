var WebRTC = require('./wrtc');
var client = io.connect('localhost');
var jq = function $(selector){
  return document.querySelectorAll(selector);
};

 //Should have properties onLocalStream, onRemoveLocalStream, onRemoteStream, onRemoveRemoteStream

  var webrtc = WebRTC({
    webrtcConfig: {
      debug:false
    }
  });

  var rtc = webrtc.RTC();
  webrtc.jq = jq;

  client.on('new-peer', webrtc.newPeer.bind(rtc));

  client.on('signal', function(data){
    rtc.handlers.sig(data);
  });

  client.on('peer-disconnect', function(data){
    var id = data.id;
    webrtc.removePeer(id);
  });


  webrtc.on('message', function(message){
    client.emit('signal', message);
  });

  var myInfo = webrtc.getMyInfo();
  function create(stream){
    var elem = document.createElement('video');
    elem.autoplay = true;
    document.body.appendChild(elem);
    attachMediaStream(elem, stream);
    return elem;
  }

  webrtc.on('LocalStreamAdded', function(stream){
    var elem = create(stream);
    elem.id = "local";
    myInfo.elem = elem;
  });

  webrtc.on('LocalStreamStopped', function(){
    myInfo.elem.hidden = true;
  });

  webrtc.on('PeerStreamAdded', function(peer){
    var id = peer.id;
    peer.elem = create(peer.stream);
    peer.elem.id = id;
  });

  webrtc.on('PeerStreamRemoved', function(peer){
    if(peer.elem){
      peer.elem.remove();
    }
  });

  webrtc.on('PeerDataMessage', function(){
    console.log(arguments);
  });
  
  webrtc.start(function(err, stream){
    client.emit('join', {room:1234});
  });

module.exports = webrtc;
