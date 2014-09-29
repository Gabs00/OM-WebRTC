WebRTC client that utilizes the [webrtc library](https://github.com/HenrikJoreteg/webrtc.js) to manage multiple clients

#### Setup

See `config.js` for configuration options. Has default options that work out of the box when using the provided `server.js`.

#### To see an example

    npm install
    node build-sample.js
    npm start

Then navigate to localhost:9000/#1234

#### Signalling

Socket.io is used for signalling, though that can be changed in the `config.js` file