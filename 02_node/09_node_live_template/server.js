// Expanded Web
// NYUSH F25 - gohai

// you probably don't even need to modify this file :)

let express = require('express');
let http = require('node:http');
let socketIo = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = new socketIo.Server(server);
let port = 3000;
let strokes=[];

app.use(express.static('public'));



io.on('connection', function(socket) {
  console.log(socket.id + ' connected from ' + socket.handshake.address);
  socket.emit('allStrokes', strokes);

  // socket.on('disconnect', function(reason) {
  //   console.log(socket.id + ' disconnected');
  // });
  socket.on('draw', function(data) {
    socket.broadcast.emit('draw', data);
    strokes.push(data);
  });

  // socket.onAny(function(event, ...args) {
  //   console.log(socket.id, event, ...args);
  //   socket.broadcast.emit(event, ...args);
  // });
  socket.on('disconnect', function(reason) {
    console.log(socket.id + ' disconnected');
  });
  
});


server.listen(port, '0.0.0.0', function() {
  console.log('Example app listening on port ' + port);
});
