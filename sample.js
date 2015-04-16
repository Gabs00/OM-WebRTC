var WebRTC = require('./wrtc');
var client = io();
var jq = function $(selector){
  return document.querySelectorAll(selector);
};

 //Should have properties onLocalStream, onRemoveLocalStream, onRemoteStream, onRemoveRemoteStream

  var webrtc = WebRTC({
    webrtcConfig: {
      debug:true
    }
  });

  var rtc = webrtc.RTC();
  webrtc.jq = jq;

  console.log(client);

  //Log when socket.io client is connected to server
  client.on('connect', function(){
    console.log('Connected to socket.io on server');
  });

  //Server sends the new-peer event when another user connects
  client.on('new-peer', webrtc.newPeer.bind(rtc));

  //The signal event here represents the webrtc communications that occur
  //In order to connect (handshake)
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

  // Creates the dom video elements and appends them to the
  // dom, here we just append them directly onto the body
  function create(stream){
    var elem = document.createElement('video');
    elem.autoplay = true;
    document.body.appendChild(elem);
    attachMediaStream(elem, stream);
    return elem;
  }

  /* These events control the video display */

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

  //Connecting to a socket.io room 
  webrtc.start(function(err, stream){
    client.emit('join', { room:1234 });
  });

module.exports = webrtc;
