var bundle = require('browserify')({standalone: 'omRTC'});
var fs = require('fs');

bundle.add('./index.js');
bundle.bundle().pipe(fs.createWriteStream('wrtc.bundle.js'));