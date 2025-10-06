let socket;
let x;
let y;
let bgIsBlack = true;
let size = 100;
let changeSize = 50;
let transition = 0; 
let winSound;
let otherUsers = {};

// function preload(){
//   winSound=loadSound("win.wav")
// }
function setup() {
  createCanvas(windowWidth, windowHeight);
  x = width / 2;
  y = height / 2;
  bgcolor = color(0);
  holeColor = color(255);
  socket = io();
  socket.on('State', function(data) {
    console.log('Received state:', data);
    bgIsBlack = data.bgIsBlack;
    size = data.size;
    changeSize = data.changeSize;
    x = data.targetX * width;
    y = data.targetY * height;
    transition = 0;
  });
  socket.on('otherUser', function(data) {
    otherUsers[data.id] = {
      x: data.x * width,
      y: data.y * height
    };
  });
  socket.on('playSound', function() {
    console.log('Playing win sound!');
    winSound.play();
  });

  socket.on('userLeft', function(data) {
    delete otherUsers[data];
  });
}

function draw() {
  let c1 = color(0);
  let c2 = color(255);
  let progress = constrain(transition, 0, 1);
  
  if (bgIsBlack) {
    bgcolor = lerpColor(c2, c1, progress);
    holeColor = lerpColor(c1, c2, progress);
  } else {
    bgcolor = lerpColor(c1, c2, progress);
    holeColor = lerpColor(c2, c1, progress);
  }

  background(bgcolor);
  noCursor();

  let distance = dist(mouseX, mouseY, x, y);

  if (distance < 1) {
    // winSound.play();
    // bgIsblack = !bgIsblack;
    // transition = 0; 

    // size += changeSize;
    // if (size >= 450 || size <= 100) {
    //   changeSize *= -1;
    // }

    // x = random(0, width);
    // y = random(0, height);
    let data={
      id:socket.id
    };
    socket.emit('trigger',data)
  }

  //lerpColor
  transition += 0.05;

  //draw static circle
  noStroke();
  fill(holeColor);
  circle(x, y, size);

  //yourself
  fill(bgcolor);
  circle(mouseX, mouseY, size);
  //others
  for(let id in otherUsers){
    let user=otherUsers[id];
    fill(bgcolor);
    circle(user.x,user.y,size)
  }
}
function mouseMoved(){
  let data={
    x:mouseX/width,
    y:mouseY/height,
    id: socket.id,
  }
  socket.emit('mouseMove', data);
}
function mousePressed() {
  userStartAudio();
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
