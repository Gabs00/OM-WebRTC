//Custom configurations go here

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
module.exports.peerConfig = {};

//What will be used for transport
//we're accessing the global io object from socket.io
module.exports.transport = function(){ 
  return io('/');
};
//Transport method for communicating with the server
//Should return an object with send / receive as proprties
module.exports.signallerConfig = function(transport){
  return {
    send: function(evt, payload){
      transport.emit(evt, payload);
    },
    receive: function(evt, callback){
      transport.on(evt, callback);
    },
    join: function(callback){
      callback();
    }
  };
};

/*
  WebRTC config options
  debug: default false, whether events will be logged
  logger: object used for logging events
  peerConnectionConfig: {} , iceservers
  peerConnectionConstraints: {},  ???
  receiveMedia: ???
  enableDataChannels: Enable RTCDataChannels
*/
module.exports.webrtcConfig = {};

//What to do when a new stream is received
//Should have properties onLocalStream, onRemoveLocalStream, onRemoteStream, onRemoveRemoteStream
module.exports.streamsConfig = {};