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
let State = {
  targetX: 0.5,  
  targetY: 0.5,
  bgIsBlack: true,
  size: 100,
  changeSize: 50
};

app.use(express.static('public'));



io.on('connection', function(socket) {
  console.log(socket.id + ' connected from ' + socket.handshake.address);
  //send the current global state to the newly connected client for initial display
  socket.emit('State', State);
  //listen for my mouse move
  socket.on('mouseMove',function(data){
    //broadcast it to all others
      socket.broadcast.emit('otherUser', {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });
  //trigger! update
  socket.on('trigger', function(data) {
    console.log(socket.id + ' triggered!');
    State.bgIsBlack = !State.bgIsBlack;
    State.size += State.changeSize;
    if (State.size >= 450 || State.size <= 100) {
      State.changeSize *= -1;
    }
    State.targetX = Math.random();
    State.targetY = Math.random();
  
    //broadcast the updated state to all clients to sync the display
    io.emit('State', State);
    io.emit('playSound');
  });
  // socket.on('collisionPush', function(data) {
  //   io.emit('otherUser', {
  //     id: data.id,
  //     x: data.x,
  //     y: data.y
  //   });
  // });


  socket.on('disconnect', function(reason) {
    console.log(socket.id + ' disconnected');
    socket.broadcast.emit('userLeft', socket.id);
  });
  
});



server.listen(port, "0.0.0.0", function() {
  console.log('Example app listening on port ' + port);
});
