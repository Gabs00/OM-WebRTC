/*
  All Events
*/
function Logger(ignore){
  this.ignore = ignore;
  this.debug = true;
  this.state = 'all';
  this.events = {
    signal:['offer', 'answer', 'candidate', 'message'],
    transport:['signal', 'sending', 'message', 'getting'],
    pc: ['close', 'negotiationNeeded', 'iceConnectionStateChange', 'signalingStateChange', 'createPeer'],
    data:['channelMessage'],
    stream:['peerStreamAdded', 'localStream', 'localStreamStopped', 'peerStreamRemoved'],
    voice:['stoppedSpeaking', 'audioOff', 'audioOn', 'speaking', 'volumeChange', 'mute', 'unmute'],
    screen:[''],
    error:['connectivityError', 'error']
  };
  this.states = Object.keys(this.events);
  this.watch = 'peerStreamAdded';
  this.log = function(){
    if(this.checkEvent(arguments[1])){
      var args = Array.prototype.slice.call(arguments);
      console.log.apply(console, args);
    }
  };
}

Logger.prototype = Object.create(console);
Logger.prototype.changeState = function(state, watch){
  this.state = state;
  if(watch !== undefined){
    this.watch = watch;
  }
};
Logger.prototype.checkEvent = function(evt){
  if(this.debug && this.ignore.indexOf(evt) === -1){
    if(this.state === 'all' || this.watch === evt){
      return true;
    } else if(this.state === 'specific'){
      return evt === this.watch;
    } else {
      return (
        this.events[this.state].indexOf(evt) === -1 ?
        false :
        true
        );

    }
  }
  return false;
};

module.exports = Logger;