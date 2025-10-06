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
  socket.emit('State', State);
  socket.on('mouseMove',function(data){

    socket.broadcast.emit('otherUser', {
      id: socket.id,
      x: data.x,
      y: data.y
    });
  });
  socket.on('trigger', function(data) {
    console.log(socket.id + ' triggered!');
    
    State.bgIsBlack = !State.bgIsBlack;
    State.size += State.changeSize;
    
  
    if (State.size >= 450 || State.size <= 100) {
      State.changeSize *= -1;
    }
    
   
    State.targetX = Math.random();
    State.targetY = Math.random();
    
    io.emit('State', State);
    
    io.emit('playSound');
  });


  socket.on('disconnect', function(reason) {
    console.log(socket.id + ' disconnected');
    socket.broadcast.emit('userLeft', socket.id);
  });
  
});



server.listen(port, "0.0.0.0", function() {
  console.log('Example app listening on port ' + port);
});
