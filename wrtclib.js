var config = require('./configs');
var Logger = require('./Logger');
var WebRTC = require('webrtc');
var transport = config.transport();
var signaller = clientHandlers(config.signallerConfig, transport);

function createVid(stream, local){
  var toDom;
  var elem = document.createElement('video');
  if(local){
    var div = document.createElement('div');
    div.appendChild(elem);
    toDom = div;
  } else {
    toDom = elem;
  }
  elem.autoplay = true;

  document.body.appendChild(toDom);  
  attachMediaStream(elem, stream);
}

module.exports = Rtclib(signaller, config);
module.exports.signaller = signaller;
module.exports.transport = transport;

//How the client communicates
//Default will be via socket.io
function clientHandlers(options, client){
  options = options(client);
  return options;
}
function Rtclib(client, config){

  /*
    peer options
    id: unique identifier, default undefined
    stream: remote stream, default undefined
    type: 'video' , 'audio' , 'screen', default video
    oneway: ??? , default false
    enableDataChannels: enable RTCDataChannels, default parents value
    receiveMedia: true or false ???, default parents value
    parent: predefined, the parent webrtc object
    sharemyscreen: whether screensharing should be enabled, true false, default false
    prefix: browser prefix, default undefined
    broadcaster: ???, default undefined
  */
  var pc = config.peerConfig;
  function peerConfig(id, wrtc){
    var options = pc;
    var ops = {
      id:id
    };

    for(var p in options){
      ops[p] = options[p];
    }

    return ops;
  }
  function createPeer(id, wrtc){
    var config = peerConfig(id, wrtc);
    var peer = wrtc.createPeer(config);
    return peer;  
  }
  function findOrCreatePeer(id, wrtc){
    var peer = wrtc.getPeers(id);
    if(peer.length){
      peer = peer[0];
    } else {
      peer = createPeer(id, wrtc);
    }
    return peer;
  }
  //Logger is used for logging events to the console, takes a list of events to ignore
  var logger = new Logger(['volumeChange', 'speaking', 'stopSpeaking', 'channelMessage']);

  //changeState places a filter on what type of events to see
  //logger.changeState('pc');

  /*
    WebRTC config options
    debug: default false, whether events will be logged
    logger: object used for logging events
    peerConnectionConfig: {} , iceservers
    peerConnectionConstraints: {},  ???
    receiveMedia: ???
    enableDataChannels: Enable RTCDataChannels
  */

  //config WebRTC object for 
  var wrtcConfig = (function(config){
    var ops = {
      debug:true,
      logger:logger,
    };
    for(var p in config){
      ops[p] = config[p];
    }
    return ops;
  })(config.webrtcConfig);
  //create rtc manager
  var wrtc = new WebRTC(wrtcConfig);

  /*
    These are not required as the WebRTC library sets them
    Required fields when setting contraints
    audio: true false defaults to false
    video: true false defaults to false
    var mediaConstraints = {
      audio:true,
      video:true
    };
  */
//=======================     MOVE THIS OUT
  //WebRTC inherits from localMedia
  //Start requests local media streams
//=======================================

  var onStream = (function(config){
    var ops = {
      onLocalStream: function(stream){
        createVid(stream, true);
      }, 
      onRemoveLocalStream: function(){}, 
      onRemoteStream: function(peer){
        createVid(peer.stream);
      }, 
      onRemoveRemoteStream: function(){}
    };
    for(var p in config){
      ops[p] = config[p];
    }
    return ops;
  })(config.streamConfig); 
  //What to do when local stream is added
  wrtc.on('localStream', onStream.onLocalStream);

  //offer / answer / ice signalling
  wrtc.on('message', function(message){
    client.send('signal', message);
  });

  //What to do when a new remote stream is added
  wrtc.on('peerStreamAdded', onStream.onRemoteStream);

  client.receive('new-peer', function(data){
    var id = data.id;
    var peer = createPeer(id, wrtc);
    peer.start();
  });

  /*
    Peer Message Scheme
          to: Recipient of message, id for routing on server side
          broadcaster: this.broadcaster, ???
          roomType: 'video' 'audio' 'screen'
          type: messageType, 'type of message'
          payload: payload, 'metadata'
          prefix: webrtc.prefix browser prefix
  */

  client.receive('signal', function(data){
    var message = data.message;
    var id = data.id;
    var peer = findOrCreatePeer(id, wrtc);
    //does the filtering of whether it is an offer/answer or ice candidate
    peer.handleMessage(message);
  });

  return wrtc;
}
