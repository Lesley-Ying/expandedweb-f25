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
let initialState = {
  targetX: 0.5,  
  targetY: 0.5,
  bgIsBlack: true,
  size: 100,
  changeSize: 50
};
let rooms = [];  // different rooms, currently for up to two users each (but could be changed)

app.use(express.static('public'));


function findRoom(socket) {
  for (let room of rooms) {  // look into all rooms
    for (let user of room.users) {  // and through all their users
      if (user === socket) {  // to find the one that has the socket
        return room;
      }
    }
  }
  console.error('This should not happen: couldn\'t find socket in rooms');
}


io.on('connection', function(socket) {
  console.log(socket.id + ' connected from ' + socket.handshake.address);

  // see if there is a room with just a single user
  let foundRoom = false;
  for (let room of rooms) {
    if (room.users.length < 2) {
      // found one
      room.users.push(socket);
      // send the current global state to the newly connected client for initial display
      socket.emit('State', room.state);
      foundRoom = true;
      break;
    }
  }

  // no, make a new one
  if (!foundRoom) {
    let room = {
      users: [ socket ],
      // the structuredClone() function takes an object
      // and returns a copy/clone (so changing a property in one
      // won't affect the other)
      state: structuredClone(initialState),
    }
    rooms.push(room);
    // send the current global state to the newly connected client for initial display
    socket.emit('State', room.state);
  }

  // listen for my mouse move
  socket.on('mouseMove', function(data) {
    // broadcast it to all others
    let room = findRoom(socket);
    for (let user of room.users) {
      if (user !== socket) {
        user.emit('otherUser', {
          id: socket.id,
          x: data.x,
          y: data.y,
        });
      }
    }
  });

  // trigger! update
  socket.on('trigger', function(data) {
    console.log(socket.id + ' triggered!');
    let room = findRoom(socket);
    room.state.bgIsBlack = !room.state.bgIsBlack;
    room.state.size += room.state.changeSize;
    if (room.state.size >= 450 || room.state.size <= 100) {
      room.state.changeSize *= -1;
    }
    room.state.targetX = Math.random();
    room.state.targetY = Math.random();

    // broadcast the updated state to all clients to sync the display
    for (let user of room.users) {
      user.emit('State', room.state);
      user.emit('playSound');      
    }
  });


  socket.on('disconnect', function(reason) {
    console.log(socket.id + ' disconnected');
    let room = findRoom(socket);
    // remove the socket from the users array
    let index = room.users.indexOf(socket);
    room.users.splice(index, 1);
    // send a message to any remaining users
    for (let user of room.users) {
      user.emit('userLeft', socket.id);      
    }
    // remove the room if everyone left
    if (room.users.length == 0) {
      index = rooms.indexOf(room);
      rooms.splice(index, 1);
    }
  });

});



server.listen(port, "0.0.0.0", function() {
  console.log('Example app listening on port ' + port);
});
