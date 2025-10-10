// let socket;
// let x;
// let y;
// let bgIsBlack = true;
// let size = 100;
// let changeSize = 50;
// let transition = 0; 
// let winSound;
// let collisionSound;
// let lastCollisionTime = 0;
// let otherUsers ={};
// let isConnected = false;


// function preload(){
//   winSound=loadSound("win.wav")
// collisionSound = loadSound("collision.wav");
// }
// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   noCursor();
//   x = width / 2;
//   y = height / 2;
//   bgcolor = color(0);
//   holeColor = color(255);
//   socket = io();
//   //receive lastest change and keep synchronized
//   socket.on('State', function(data) {
//     console.log('Received state:', data);
//     bgIsBlack = data.bgIsBlack;
//     size = data.size;
//     changeSize = data.changeSize;
//     x = data.targetX * width;
//     y = data.targetY * height;
//     transition = 0;
//   });
//   //receive others' position from server
//   socket.on('otherUser', function(data) {
//     console.log('Received otheruser position')
//     otherUsers[data.id] = {
//       x: data.x * width,
//       y: data.y * height
//     };
//   });
//   socket.on('playSound', function() {
//     console.log('Playing win sound!');
//     winSound.play();
//   });

//   socket.on('userLeft', function(data) {
//     delete otherUsers[data];
//   });
// }

// function draw() {

//   let c1 = color(0);
//   let c2 = color(255);
//   let progress = constrain(transition, 0, 1);
  
//   //color flip
//   if (bgIsBlack) {
//     bgcolor = lerpColor(c2, c1, progress);
//     holeColor = lerpColor(c1, c2, progress);
//   } else {
//     bgcolor = lerpColor(c1, c2, progress);
//     holeColor = lerpColor(c2, c1, progress);
//   }
// if (!isConnected) {
//     fill(0);
//     textAlign(CENTER, CENTER);
//     cursor();
//     textSize(32);
//     text("Click to connect to server", width/2,height/2);
//     return; 
//   }
//   background(bgcolor);
//   noCursor();
// //check myself
//   let distance = dist(mouseX, mouseY, x, y);
// //event:trigger
//   if (distance < 1) {
//     let data={
//       id:socket.id
//     };
//     socket.emit('trigger',data)
//   }
//   //check others as well, and check whether there's collision
//   for (let id in otherUsers) {
//     let user = otherUsers[id];
//     let otherDistance=dist(user.x,user.y,x,y);
//     if(otherDistance<1){
//     let data={
//       id:id
//     };
//     socket.emit('trigger', data);
//   }
// // for collision
//     let d = dist(mouseX, mouseY, user.x, user.y);
//     if (d < size && millis() - lastCollisionTime > 1000) {
//       collisionSound.play();
//       lastCollisionTime = millis();
//     }
//   }

//   //maybe this solved the issue of sometimes background went undefined
//   if(transition<1){
//   transition += 0.05;
//   }

//   //draw static circle
//   noStroke();
//   fill(holeColor);
//   circle(x, y, size);

//   //draw myself
//   fill(bgcolor);
//   circle(mouseX, mouseY, size);
//   //draw others
//   for(let id in otherUsers){
//     let user=otherUsers[id];
//     fill(bgcolor);
//     circle(user.x,user.y,size)
//   }
// }
// function mouseMoved(){
//   let data={
//     x:mouseX/width,
//     y:mouseY/height,
//     id: socket.id,
//   }
//   //send my position to the server
//   socket.emit('mouseMove', data);
// }
// function mousePressed() {
//   if (!isConnected) {
//     isConnected = true;
//     userStartAudio();
//   }
// }
// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   noCursor();
// }
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
let otherUsers = {};
let isConnected = false;

// 用于绘制重叠效果的图层
let myLayer;
let otherLayer;

function preload() {
  winSound = loadSound("win.wav");
  collisionSound = loadSound("collision.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  x = width / 2;
  y = height / 2;
  bgcolor = color(0);
  holeColor = color(255);
  
  // 创建两个图层用于检测重叠
  myLayer = createGraphics(width, height);
  otherLayer = createGraphics(width, height);
  
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
    console.log('Received otheruser position');
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
  
  // 颜色翻转
  if (bgIsBlack) {
    bgcolor = lerpColor(c2, c1, progress);
    holeColor = lerpColor(c1, c2, progress);
  } else {
    bgcolor = lerpColor(c1, c2, progress);
    holeColor = lerpColor(c2, c1, progress);
  }
  
  if (!isConnected) {
    background(220);
    fill(0);
    textAlign(CENTER, CENTER);
    cursor();
    textSize(32);
    text("Click to connect to server", width / 2, height / 2);
    return; 
  }
  
  background(bgcolor);
  noCursor();
  
  // 检查自己是否触发目标
  let distance = dist(mouseX, mouseY, x, y);
  if (distance < 1) {
    let data = {
      id: socket.id
    };
    socket.emit('trigger', data);
  }
  
  // 检查其他用户
  for (let id in otherUsers) {
    let user = otherUsers[id];
    let otherDistance = dist(user.x, user.y, x, y);
    if (otherDistance < 1) {
      let data = {
        id: id
      };
      socket.emit('trigger', data);
    }
    
    // 碰撞音效
    let d = dist(mouseX, mouseY, user.x, user.y);
    if (d < size && millis() - lastCollisionTime > 1000) {
      collisionSound.play();
      lastCollisionTime = millis();
    }
  }

  if (transition < 1) {
    transition += 0.05;
  }

  // 绘制静态目标圆
  noStroke();
  fill(holeColor);
  circle(x, y, size);

  // 绘制自己的圆（不带重叠效果）
  fill(bgcolor);
  circle(mouseX, mouseY, size);
  
  // 如果有其他用户，绘制他们的圆并计算重叠
  for (let id in otherUsers) {
    let user = otherUsers[id];
    
    // 先正常绘制对方的圆
    fill(bgcolor);
    circle(user.x, user.y, size);
    
    // 检查是否重叠，如果重叠则绘制交集效果
    let d = dist(mouseX, mouseY, user.x, user.y);
    if (d < size) {
      // 清空图层
      myLayer.clear();
      otherLayer.clear();
      
      // 在图层上绘制两个圆
      myLayer.fill(255);
      myLayer.noStroke();
      myLayer.circle(mouseX, mouseY, size);
      
      otherLayer.fill(255);
      otherLayer.noStroke();
      otherLayer.circle(user.x, user.y, size);
      
      // 计算并绘制交集
      drawIntersection(myLayer, otherLayer);
    }
  }
}

function drawIntersection(a, b) {
  loadPixels();
  a.loadPixels();
  b.loadPixels();
  
  // 获取 holeColor 的 RGB 值
  let r = red(holeColor);
  let g = green(holeColor);
  let bl = blue(holeColor);
  
  for (let i = 0; i < a.pixels.length; i += 4) {
    // 如果两个图层在这个像素位置都有内容（都不透明）
    if (a.pixels[i + 3] != 0 && b.pixels[i + 3] != 0) {
      // 在主画布上绘制 holeColor
      pixels[i + 0] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = bl;
      pixels[i + 3] = 255;
    }
  }
  updatePixels();
}

function mouseMoved() {
  let data = {
    x: mouseX / width,
    y: mouseY / height,
    id: socket.id,
  };
  socket.emit('mouseMove', data);
}

function mousePressed() {
  if (!isConnected) {
    isConnected = true;
    noCursor();
    userStartAudio();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (isConnected) {
    noCursor();
  }
  
  myLayer = createGraphics(width, height);
  otherLayer = createGraphics(width, height);
}