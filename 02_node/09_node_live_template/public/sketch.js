// Expanded Web
// NYUSH F25 - gohai

let socket;

function setup() {
  createCanvas(windowWidth,windowHeight);
  background(204);
  socket = io();

  // socket.on('something', function(data) {
  //   console.log('received', data);
  //   fill(0);
  //   ellipse(data.x, data.y, 10, 10);
  //   // do something with the data
  // });
  socket.on('allStrokes', function(data) {
    //background(255);
    for (let i=0; i < data.length; i++) {
      circle(data[i].x, data[i].y, 5);
    }
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
