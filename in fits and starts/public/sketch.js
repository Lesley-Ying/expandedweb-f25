// Expanded Web
// NYUSH F25 - gohai

let socket;
let pointers = {};
let instruction = '';
let offset = 0;
let speed = 1;
let isMoving = true;
let otherUsers = {};

function setup() {
  createCanvas(640, 360);
  noStroke();
  rectMode(CENTER);
  socket = io();
  socket.on('trigger', function(data) {
    console.log('received trigger from', data.id);
    isMoving = !isMoving;

    if (isMoving) {
      arduino.write('1\n');
    } else {
      arduino.write('0\n');
    }

  });
  // socket.on('mousemove', function(data) {
  //   console.log('received mousemove', data);
  //   pointers[data.id] = data;
  //   pointers[data.id].lastSeen = millis();
  // });

  // socket.on('instruction', function(data) {
  //   console.log('received instruction', data);
  //   instruction = data;
  // });
}

function draw() {
  // this uses clear() instead of background() to
  // erase all pixels, but keep them transparent
  // so that the <img> with the webcam image
  // underneath shines through
  clear();
  
  let totalSpacing = 40;

  if (isMoving) {
    offset -= speed;
    if (offset < -totalSpacing) {
      offset += totalSpacing;
    }
  }

  let numStripes = 90;
  let baseStripeHeight = 12;
  let appear = height * 0.4;
  let disappear = height;

  for (let i = numStripes; i >= -numStripes; i--) {
    let wave = sin(i * 0.2 + frameCount * 0.01) * 3;
    let localOffset = offset + (isMoving ? wave : 0);
    let pos = disappear - (i * totalSpacing + localOffset);

    if (pos >= appear && pos <= disappear + 5) {
      let t = map(pos, appear, disappear, 0, 1);
      let distanceFactor = pow(t, 1.5);
      let stripeHeight = baseStripeHeight * lerp(0.5, 3.0, distanceFactor);
      let lineWidth = lerp(150, 300, distanceFactor);
      let centerX = lerp(width * 0.95, width * 0.05, distanceFactor);
      let alpha = 255 * (1 - distanceFactor) * 0.9;
      let baseGray = 60; 

      let lightR, lightG, lightB;
      if (isMoving) {
        lightR = 0.95;
        lightG = 1.05;
        lightB = 1.0;
      } else {
        lightR = 1.2;
        lightG = 0.9;
        lightB = 0.9;
      }

      let breathe = map(sin(frameCount * 0.03 + i * 0.1), -1, 1, 0.95, 1.05);

      let r = baseGray * lightR * breathe;
      let g = baseGray * lightG * breathe;
      let b = baseGray * lightB * breathe;

      fill(r, g, b, alpha);
      rect(centerX - lineWidth / 2, pos, lineWidth, stripeHeight);
    }
  }
  
  // for (let id in pointers) {
  //   if (millis() - pointers[id].lastSeen > 3000) {
  //     delete pointers[id];
  //   } else {
  //     fill(255);
  //     beginShape();
  //     vertex(pointers[id].x, pointers[id].y);
  //     vertex(pointers[id].x, pointers[id].y+16);
  //     vertex(pointers[id].x+4, pointers[id].y+12);
  //     vertex(pointers[id].x+10, pointers[id].y+12);
  //     endShape(CLOSE);
  //     textSize(8);
  //     text(id, pointers[id].x, pointers[id].y + 30);
  //     //text(pointers[id].ip, pointers[id].x, pointers[id].y + 30);
  //   }
  // }

  // text(instruction, 50, 50);
}

// function mouseMoved() {
//   // those values can get bigger than the size of
//   // the canvas
//   let x = constrain(mouseX, 0, width);
//   let y = constrain(mouseY, 0, height);

//   let data = {
//     x: x,
//     y: y,
//     id: socket.id,  // send our id for others to keep the data apart
//   }
//   socket.emit('mousemove', data);
//}
function keyPressed() {
  if (keyCode === 32){
    let data = {
      id: socket.id
    };
    socket.emit('trigger', data);
  } 
}

