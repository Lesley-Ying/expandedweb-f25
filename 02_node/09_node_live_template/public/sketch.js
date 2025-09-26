// Expanded Web
// NYUSH F25 - gohai

let socket;

function setup() {
  createCanvas(400, 400);
  background(204);
  socket = io();

  socket.on('something', function(data) {
    console.log('received', data);
    // do something with the data
  });
}

function draw() {
  //background(204);
}

function mousePressed() {
  let data = {
    x: mouseX,
    y: mouseY,
    id: socket.id,  // often useful to have this id
    // add other data to send here
  }
  fill(0);
  ellipse(mouseX,mouseY,10,10);
  socket.emit('something', data);


  // besides just "something" you can also have multiple,
  // different kinds of messages (each with their own event
  // handler in setup)
}
