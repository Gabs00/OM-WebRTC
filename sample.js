var WebRTC = require('./wrtclib');
var path = window.location.hash;

if(!path.match(/^\#[a-z0-9]+$/i) && path !== ''){
  console.log(path);
  path = '';
}

function joinRoom(room, client){
  if(room.length > 1){
    client.send('join', {room:room});
  }
}
var room = path;
var webrtc = WebRTC({});
webrtc.start(null, function(err, stream){
  joinRoom(room, webrtc.signaller);
});

module.exports = WebRTC;