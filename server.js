//Test Server
var express = require('express')();
var http = require('http');
var fs = require('fs');
var app = http.createServer(express);
var io = require('socket.io')(app);

app.listen(9000, function(){
	console.log('listening on 9000');
});

io.on('connect', function(socket){
	console.log(socket.connected);
  socket.on('signal', function(data){
  	console.log(socket.id, 'Forwarding to', data.to);
    socket.broadcast.to(data.to).emit('signal', {message:data, id:socket.id});
  });

  socket.on('join', function(data){
    socket.join(data.room);
    socket.myroom = data.room;
    console.log('joined to room', data);
    socket.broadcast.to(data.room).emit('new-peer', {id:socket.id});
  });
  socket.on('disconnect', function(){
  	console.log('user disco', socket.id);
  	socket.broadcast.to(socket.myroom).emit('peer-disconnect', {id:socket.id});
  });
});

express.use('/', function(req,res){
	console.log(req.url);
	res.sendFile(req.url, {root:'./'});
});