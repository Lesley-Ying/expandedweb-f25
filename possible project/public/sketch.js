// Expanded Web
// NYUSH F25 - gohai

let socket;
let pointers = {};
let instruction = '';
let numPoints = 100;
let isMoving = true; // true 表示行人（ellipse），false 表示车辆（strip）
let lastSwitch = 0;
let switchInterval = 10000; // 10 秒
let countdown = switchInterval;
let targetState = isMoving;
let ellipses = [];
let strips = [];
let lastSpawn = 0;
let spawnInterval = 2000; // 每 2 秒生成一次
let lastIsMoving = isMoving;
let isConnected=false;
let lastSecond = -1;

function preload() {
  carSound = loadSound("cars.wav");
  tickSound=loadSound("tick.wav");
  
  
}
function setup() {
  createCanvas(640, 360);
  angleMode(DEGREES);
  
  spacing = width / numPoints;

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
  let leftCount = 0;
  let rightCount = 0;
  if (!isConnected) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    stroke(0);
    text("Click to connect to server", width/2,height/2);
    return; 
  }
  

  if (mouseX < width / 2) {
    leftCount++;
  } else {
    rightCount++;
  }
  
  for (let id in pointers) {
    if (millis() - pointers[id].lastSeen > 3000) {
      delete pointers[id];
    } else {
      if (pointers[id].x < width / 2) {
        leftCount++;
      } else {
        rightCount++;
      }
    }
  }
  // 根据左右人数决定目标状态
  if (leftCount > rightCount) {
    targetState = true;  // 绿灯 - 行人通行
  } else if (rightCount > leftCount) {
    targetState = false; // 红灯 - 车辆通行
  }
  

  // 倒计时逻辑
  let now = millis();
  countdown = switchInterval - (now - lastSwitch);

  if (countdown <= 0) {
    isMoving = targetState;
    lastSwitch = now;
    countdown = switchInterval;
    if(!isMoving){
      carSound.play();
    }else{
      walkSound.play();
    }
  }
  let currentSecond = int(countdown / 1000); // 当前剩余秒数
if (currentSecond != lastSecond) {
  tickSound.play(); // 每秒变化时播放一次
  lastSecond = currentSecond;
}

 

  // 每隔 spawnInterval 生成 1-5 个对象
  if (now - lastSpawn > spawnInterval) {
    lastSpawn = now;
    let n = int(random(1, 3));
    let n2 = int(random(1, 3));
    if (isMoving) {
      for (let i = 0; i < n; i++) {
        ellipses.push(new EllipseObj(-50, 0, random(0.5, 1)));
      }
    } else {
      for (let i = 0; i < n2; i++) {
        strips.push(new StripObj(-100, 0, random(5, 9)));
      }
    }
  }

  // 更新与显示
  if (isMoving) {
    
    for (let i = ellipses.length - 1; i >= 0; i--) {
      ellipses[i].update();
      ellipses[i].display();
      if (ellipses[i].x > width + 200) {
        ellipses.splice(i, 1);
      }
    }
  } else {
    
    for (let i = strips.length - 1; i >= 0; i--) {
      strips[i].update();
      strips[i].display();
      if (strips[i].x > width + 400) {
        strips.splice(i, 1);
      }
    }
  }
   // 显示倒计时（整数）
  fill(0);
  textSize(38);
  text(int(countdown / 1000), width / 2,height/2 );
  

  for (let id in pointers) {
    if (millis() - pointers[id].lastSeen > 3000) {
      delete pointers[id];
    } else {
      fill("yellow"); 
      stroke(0);
      strokeWeight(2);
      beginShape();
      vertex(pointers[id].x, pointers[id].y);
      vertex(pointers[id].x, pointers[id].y + 16);
      vertex(pointers[id].x + 4, pointers[id].y + 12);
      vertex(pointers[id].x + 10, pointers[id].y + 12);
      endShape(CLOSE);
      noStroke();
      fill(255);
      textSize(8);
      text(id.substring(0, 5), pointers[id].x, pointers[id].y + 30);
    }
  }

  
  
  noStroke();
  // 向服务器发送倒计时与目标状态
  socket.emit('ledUpdate', {
    countdown: countdown,
    targetState: isMoving ? 'GREEN' : 'RED'
  });
  if(mouseX<width/2){
    fill("green");
    noStroke();
circle(mouseX,mouseY,20)
  }
  if(mouseX>=width/2){
    fill("red")
    noStroke();
    circle(mouseX,mouseY,20)
  }
  
}
class EllipseObj {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = -45; // 保持与 strip 一致的倾斜角

    // 让椭圆主轴长度在整体对角线的 0.8~1.2 倍之间变化
    this.length = dist(0, 0, width, height) * random(0.2, 0.8);

    // 厚度在一定范围波动，体现“形体差异”
    this.thickness = random(25, 50);

    // 轻微随机透明度，避免单调
    this.alpha = random(140, 200);
  }

  update() {
    this.x += this.speed * 2;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
   fill(128,128,128,this.alpha)
    noStroke();
    ellipse(0, 0, this.length, this.thickness);
    pop();
  }
}

// --------- Strip 类（车流倒影）---------
class StripObj {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = -45;
    this.width = random(120, 150); // 条带厚度
    this.length = dist(0, 0, width, height) * 2.4; // 比对角线稍长，确保全覆盖
    this.alpha = random(140, 200);
  }

  update() {
    this.x += this.speed * 2;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    rectMode(CENTER); 
  fill(128,128,128,this.alpha);
    noStroke();
    rect(0, 0, this.length, this.width);
    pop();
  }
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
function mousePressed() {
  if (!isConnected) {
    isConnected = true;
    userStartAudio();
  }
}
