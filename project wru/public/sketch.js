let socket;
let x;
let y;
let bgIsBlack = true;
let size = 100;
let changeSize = 50;
let transition = 0; 
let winSound;
let collisionSound;
let lastCollisionTime = 0;
let otherUsers ={};
let isConnected = false;


function preload(){
  winSound=loadSound("win.wav")
collisionSound = loadSound("collision.wav");
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  x = width / 2;
  y = height / 2;
  bgcolor = color(0);
  holeColor = color(255);
  socket = io();
  //receive lastest change and keep synchronized
  socket.on('State', function(data) {
    console.log('Received state:', data);
    bgIsBlack = data.bgIsBlack;
    size = data.size;
    changeSize = data.changeSize;
    x = data.targetX * width;
    y = data.targetY * height;
    transition = 0;
  });
  //receive others' position from server
  socket.on('otherUser', function(data) {
    console.log('Received otheruser position')
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
  if (!isConnected) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Click to connect to server", width/2,height/2);
    return; 
  }
  
  
  //color flip
  if (bgIsBlack) {
    bgcolor = lerpColor(c2, c1, progress);
    holeColor = lerpColor(c1, c2, progress);
  } else {
    bgcolor = lerpColor(c1, c2, progress);
    holeColor = lerpColor(c2, c1, progress);
  }

  background(bgcolor);
  noCursor();
//check myself
  let distance = dist(mouseX, mouseY, x, y);
//event:trigger
  if (distance < 1) {
    let data={
      id:socket.id
    };
    socket.emit('trigger',data)
  }
  //check others as well, and check whether there's collision
  for (let id in otherUsers) {
    let user = otherUsers[id];
    let otherDistance=dist(user.x,user.y,x,y);
    if(otherDistance<1){
    let data={
      id:id
    };
    socket.emit('trigger', data);
  }
  resolveCollision(mouseX, mouseY, user);

   }

  //maybe this solved the issue of sometimes background went undefined
  if(transition<1){
  transition += 0.05;
  }

  //draw static circle
  noStroke();
  fill(holeColor);
  circle(x, y, size);

  //draw myself
  fill(bgcolor);
  circle(mouseX, mouseY, size);
  //draw others
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
  //send my position to the server
  socket.emit('mouseMove', data);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  noCursor();
}
function mousePressed() {
  if (!isConnected) {
    isConnected = true;
    userStartAudio();
  }
}

function resolveCollision(px, py, user) {
  let thisPos = createVector(px, py);
  let otherPos = createVector(user.x, user.y);
  let vector = p5.Vector.sub(otherPos, thisPos);
  let distance = vector.mag();

  if (distance < size && distance > 0) {
    // collided!
    let force = vector.copy();
    force.mult(-1);
    force.normalize();
    force.mult(1.3); 
    otherPos.add(force);

    user.x = otherPos.x;
    user.y = otherPos.y;
    
    // let data = {
    //   x: otherPos.x / width,
    //   y: otherPos.y / height,
    //   id: userId,
    //   isCollision: true
    // };
    //socket.emit('collisionPush', data);
    if (millis() - lastCollisionTime > 500) {
      collisionSound.play();
      lastCollisionTime = millis();
    }
  }
}

