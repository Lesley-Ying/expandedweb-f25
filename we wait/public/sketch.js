// Expanded Web
// NYUSH F25 - gohai

let socket;
let pointers = {};
let avgMovement = 0;

function setup() {
  createCanvas(640, 360);
  socket = io();

  socket.on('mousemove', function(data) {
    pointers[data.id] = data;
    pointers[data.id].lastSeen = millis();
  });

  socket.on('avgMovement', function(data) {
    avgMovement = data;
  });
}

function draw() {
  clear();
  background(0); 
  erase();
  ellipse(width / 2, height / 2, 300, 300); 
  noErase();
  
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
    }
  }

  // 显示平均移动速度
  fill(255);
  textSize(26);
  text(avgMovement.toFixed(1), 10, 30);
}

function mouseMoved() {
  let x = constrain(mouseX, 0, width);
  let y = constrain(mouseY, 0, height);

  let data = {
    x: x,
    y: y,
    id: socket.id,
  }
  socket.emit('mousemove', data);
}