WebRTC client that utilizes the [webrtc library](https://github.com/HenrikJoreteg/webrtc.js) to manage multiple clients

#### Setup

See `sample.js` for example usage.

#### To use the example

    npm install
    node build-sample.js
    npm start

Then navigate to localhost:9000

#### Signalling

Socket.io is used for signalling in the examples, some sort of signalling channel that allows webrtc to set up calls between peers is required.