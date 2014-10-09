var Logger = require('./Logger');
var WebRTC = require('webrtc');



module.exports = function(configObj){
  var logger = new Logger(['volumeChange', 'speaking', 'stopSpeaking', 'channelMessage']);
  var WebRTC = Rtclib(configObj, logger);
  return WebRTC;
};

function Rtclib(config, logger){

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
    wrtc.emit('addUser', peer);
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
  logger.debug = wrtcConfig.debug;
  //create rtc manager
  var wrtc = new WebRTC(wrtcConfig);

  /*
    on localMedia.start() parameter
    These are not required as the WebRTC library sets them
    Required fields when setting contraints
    audio: true false defaults to false
    video: true false defaults to false
    var mediaConstraints = {
      audio:true,
      video:true
    };
  */

  // //What to do when a new remote stream is added
  // wrtc.on('peerStreamAdded', onStream.onRemoteStream);
  wrtc.onNewPeer = config.NewPeer || createPeer;
  wrtc.onFindOrCreatePeer = config.findOrCreate || findOrCreatePeer;

  /*
    Peer Message Scheme
          to: Recipient of message, id for routing on server side
          broadcaster: this.broadcaster, ???
          roomType: 'video' 'audio' 'screen'
          type: messageType, 'type of message'
          payload: payload, 'metadata'
          prefix: webrtc.prefix browser prefix
  */
  function signal(data){
    var message = data.message;
    var id = data.id;
    var peer = wrtc.onFindOrCreatePeer(id, wrtc);
    //does the filtering of whether it is an offer/answer or ice candidate
    peer.handleMessage(message);
  }

  var signallingEvents = {
    sig: signal,
    onOffer: signal,
    onAnswer: signal,
    onIce: signal
  };

  wrtc.handlers = {};

  (function(){
    var ops = config.signalHandlers || {};
    for(var p in ops){
      signallingEvents[p] = ops[p];
    }

    for(var evt in signallingEvents){
      wrtc.handlers[evt] = signallingEvents[evt];
    }
  })();


  return wrtc;
}
