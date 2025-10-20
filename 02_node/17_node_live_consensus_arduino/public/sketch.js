// Expanded Web
// NYUSH F25 - gohai

let socket;
let pointers = {};
let instruction = '';

function setup() {
  createCanvas(640, 360);

  socket = io();

  socket.on('mousemove', function(data) {
    console.log('received mousemove', data);
    pointers[data.id] = data;
    pointers[data.id].lastSeen = millis();
  });

  socket.on('instruction', function(data) {
    console.log('received instruction', data);
    instruction = data;
  });
}

function draw() {
  // this uses clear() instead of background() to
  // erase all pixels, but keep them transparent
  // so that the <img> with the webcam image
  // underneath shines through
  clear();
  
  for (let id in pointers) {
    if (millis() - pointers[id].lastSeen > 3000) {
      delete pointers[id];
    } else {
      fill(255);
      beginShape();
      vertex(pointers[id].x, pointers[id].y);
      vertex(pointers[id].x, pointers[id].y+16);
      vertex(pointers[id].x+4, pointers[id].y+12);
      vertex(pointers[id].x+10, pointers[id].y+12);
      endShape(CLOSE);
      textSize(8);
      text(id, pointers[id].x, pointers[id].y + 30);
      //text(pointers[id].ip, pointers[id].x, pointers[id].y + 30);
    }
  }

  text(instruction, 50, 50);
}

function mouseMoved() {
  // those values can get bigger than the size of
  // the canvas
  let x = constrain(mouseX, 0, width);
  let y = constrain(mouseY, 0, height);

  let data = {
    x: x,
    y: y,
    id: socket.id,  // send our id for others to keep the data apart
  }
  socket.emit('mousemove', data);
}
