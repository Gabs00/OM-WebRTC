var wrtclib = require('./wrtclib');
var util = require('util');
var wild = require('wildemitter');

/*
  The obect created below is for managing the webrtc data portion
  Needs to: 
    Provide Access to - 
      Peer streams
      WebRTC configuration
      local streams
      provide methods mute and unmute local stream RTCpeerConnection / M4ediaStream API ourmeeting website repo 

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
  var Wrtc = function(){
    wild.call(this);
  };
  util.inherits(Wrtc, wild);
  
  var webrtc = new Wrtc();

  var me = { stream: null, id:null };
  var userids = [];
  //webrtc.prototype = {};
  //WebRTC Session Manager - Peer Connection Initializer
  var peerManager = wrtclib(configObj);


  webrtc.setRTC = function(peerObj){
    peerManager = peerObj;
  };
  /*
    Meeting Specific events 
      LocalStreamAdded
      LocalStreamStopped
      LocalAudioMuted
      LocalAudioUnmuted
      LocalVideoPaused
      LocalVideoResumed

      PeerAdded
      PeerRemoved
      PeerStreamAdded
      PeerStreamRemoved
      PeerStreamEnabled
      PeerStreamDisabled
      PeerDataAdded
      PeerDataMessage
  */
  //Event mapping
  var evt = {
    'localStream':'LocalStreamAdded',
    'localStreamStopped':'LocalStreamStopped',
    'audioOff':'LocalAudioMuted',
    'audioOn':'LocalAudioUnmuted',    
    'videoOff':'LocalVideoPaused',
    'videoOn':'LocalVideoResumed',    
    'addUser':'PeerAdded',
    'removeUser':'PeerRemoved',
    'peerStreamAdded':'PeerStreamAdded',
    'peerStreamRemoved':'PeerStreamRemoved',
    'unmute':'PeerStreamEnabled',
    'mute':'PeerStreamDisabled',
    'message': 'message',
    'channelMessage': 'PeerDataMessage',
    'channelOpen': 'PeerDataAdded'
  };

  function elevateEvents(event){
    var args = Array.prototype.slice.call(arguments, 1);
    var normalize = evt[event];
    if(normalize){
      args.unshift(evt[event]);
      console.log("EVENT ARGUMENTS:",event, args);
      webrtc.emit.apply(webrtc,args);
    }
  }

  //Renames events in evt and forwards them
  peerManager.on('*', elevateEvents);

  peerManager.on('addUser', function(peer){
    userids.push(peer.id);
    peer.on('*', elevateEvents);
  });

  //Gets the localMediaStream and then emits it once it is available
  //Generally you don't want to start receiving peer connections until after
  //calling this function. Args are not required is not required. callback is the 
  //last thing executed.
  webrtc.start = function(callback, contraints){
    contraints = contraints || null;
    peerManager.start(contraints, function(err, stream){
      if(typeof callback === 'function'){
        callback(err, stream);
      }
    });
  };

  webrtc.on('PeerNew', function(data){
    var id = data.id;
    var peer = peerManager.onNewPeer(id, peerManager);
    peer.start();
  });

  webrtc.newPeer = function(peer){
    webrtc.emit('PeerNew', peer);
  };

  webrtc.removePeer = function(id){
    peerManager.removePeers(id);
    webrtc.emit('PeerRemoved', id);
    var index = userids.indexOf(id);
    if(index !== -1) userids.splice(index, 1);
  };

  //Returns a list of peer objects
  webrtc.getPeers = function(){
    return peerManager.getPeers();
  };

  webrtc.addLocalStream = function(stream){
    me.stream = stream;
  };

  webrtc.getAllUsers = function(){
    var peers = webrtc.getPeers();
    peers.forEach(function(pc){
      if(userids.indexOf(pc.id) === -1){
        userids.push(pc.id);
      }
    });
    return userids;
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

  //Returns own stream and id 
  webrtc.getMyInfo = function(){
    return me;
  };

  webrtc.RTC = function(){
    return peerManager;
  };

  /*
    Local Stream Controls
  */

  webrtc.streamController = {
    mute: peerManager.mute.bind(peerManager),
    unmute: peerManager.unmute.bind(peerManager),
    pauseVideo: peerManager.pauseVideo.bind(peerManager),
    resumeVideo: peerManager.resumeVideo.bind(peerManager),
    pause: peerManager.pause.bind(peerManager),
    resume: peerManager.resume.bind(peerManager),
    kill: peerManager.stop.bind(peerManager, webrtc.getMyInfo().stream)
  };

  webrtc.createChatChannel = function(opts){
    webrtc.chat = {};
    userids.forEach(function(id){
      var peerChannel = webrtc.getUser(id).getDataChannel('chat', opts);
      webrtc.chat[id] = peerChannel;
    });
    webrtc.emit('ChatChannel', webrtc.chat);
    return webrtc.chat;
  };

  webrtc.sendChat = function(message, payload){
    if(webrtc.chat === undefined){
      webrtc.createChatChannel();
    }
    peerManager.sendDirectlyToAll('chat', message, payload);
  };
  webrtc.createScreenShareChannel = function(){
    console.log('This feature is not yet implimented');
  };
  return webrtc;
}
module.exports = WebRTC;
