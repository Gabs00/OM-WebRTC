//Custom configurations descriptions and Examples
e = {
  //PeerConnection config
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
    peerConfig:{
      type:video,
      receiveMedia:true
    },

  /*
    WebRTC config options
    debug: default false, whether events will be logged
    logger: object used for logging events
    peerConnectionConfig: {} , iceservers
    peerConnectionConstraints: {},  ???
    receiveMedia: ???
    enableDataChannels: Enable RTCDataChannels
  */
  webrtcConfig :{

  },

  //What to do when a new stream is received


  //Event listeners to add onto webrtc object
  //Options onOffer, onAnswer, onIce
  signallingEvents :{
    'onOffer':function(stream){}
  }
};

