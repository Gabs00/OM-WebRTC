var b = require('browserify')({standalone: 'WebRTC'});
var fs = require('fs');

b.add('./sample.js');
b.bundle().pipe(fs.createWriteStream('sample.bundle.js'));