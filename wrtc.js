var wrtclib = require('wrtclib.js');
var util = require('util');
var wild = require('wildemitter');

/*
  The obect created below is for managing the webrtc data portion
  Needs to: 
    Provide Access to - 
      Peer streams
      WebRTC configuration
      local streams

    Provide events for when - (using wild emitter)
      new connection process has started
      a new connection has been established
      new streams are added
      streams are muted / unmuted
      streams end

      --Note on events, review the webrtc.js module in the node_modules
        folder for events emitted. wrtclib extends the webrtc.js module

    Provide the ability to listen on this object for changes

*/
//User a function to make this easily adaptable to angular
function WebRTC(configObj){
  var webrtc = {};
  var me = { stream: null, id:null };
  var peerManager = wrtclib(configObj);

  util.inherits(webrtc, wildemitter);

  webrtc.setRTC = function(peerObj){
    peerManager = peerObj;
  };

  webrtc.getPeers = function(){
    return peerManager.getPeers();
  };

  webrtc.addLocalStream = function(stream){
    me.stream = stream;
  };

  //Actions to take when receiving a local stream
  webrtc.onLocalStream = function(callback){
    webrtc.onLocalStream = callback;
  };

  webrtc.onlocalstream = function(stream){
    webrtc.addLocalStream(stream);
    webrtc.onLocalStream(stream);
  };

  //Actions to be taken when receiving a remote stream
  webrtc.onRemoteStream = function(callback){
    webrtc.onRemoteStream = callback;
  };

  webrtc.onremotestream = function(peer){
    webrtc.onRemoteStream(peer.stream, peer.id, peer);
  };

  webrtc.onRemoteStreamRemoval = function(callback){
    webrtc.onRemoteStreamRemoval = callback;
  };

  webrtc.onremotestreamremoval = function(peer){
    webrtc.onRemoteStreamRemoval(peer);
  };

  webrtc.getAllUsers = function(){
    var ids = [];
    var peerManager = webrtc.getPeers();
    peerManager.forEach(function(pc){
      ids.push(pc.id);
    });
    return ids;
  };

  webrtc.getUser = function(user){
    var users = peerManager.getPeers(user);
    if(users){
      return users[0];
    }
  };
  //Stream has all associated streams, video/audio/datachannel
  webrtc.getStream = function(user){
    var peer = webrtc.getUser(user);
    if(peer !== undefined){
      return peer.stream;
    }
  };

  webrtc.getVideoStream = function(user){
    var stream = webrtc.getStream(user);
    if(stream !== undefined) {
      return stream.getVideoTracks();
    }
  };

  webrtc.getAudioStream = function(user){
    var stream = webrtc.getStream(user);
    if(stream !== undefined) {
      return stream.getAudioTracks();
    }
  };

  webrtc.setId = function(id){
    me.id = id;
  };

  webrtc.getMyInfo = function(){
    return me;
  };

  webrtc.RTC = function(){
    return peerManager;
  };
  return webrtc;
}
module.exports = WebRTC;