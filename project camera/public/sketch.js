// Expanded Web
// NYUSH F25 - gohai

let offset = 0;
let speed = 1;      // 保持速度
let isMoving = true;  // 控制移动的开关

function setup() {
  createCanvas(800, 600);
  noStroke();

  
  video.hide(); // 我们只要画面内容，不要 HTML 元素
}

function draw() {
  // 保持背景透明
  //background(0); 
  
clear();
  // === 控制移动和无限循环 ===
  let totalSpacing = 80; 

  if (isMoving) {
    offset -= speed; 

    if (offset < -totalSpacing) {
        offset += totalSpacing;
    }
  }
  // ============================
  
  // 斑马线参数
  let numStripes = 60; 
  let baseStripeHeight = 8; 
  
  // === 定义透视的关键点 (核心修改在这里) ===
  // 1. 降低虚拟地平线 (更贴地/压缩感)
  let VIRTUAL_HORIZON_Y = height * 0.3; // 从 0.2 增加到 0.3
  let FOREGROUND_Y = height * 1.0;     

  fill(255, 255); 
  
  for (let i = numStripes; i >= -numStripes; i--) { 
    
    let startY = FOREGROUND_Y; 
    let pos = startY - (i * totalSpacing + offset);

    // 2. 裁剪 y 轴
    if (pos < VIRTUAL_HORIZON_Y || pos > FOREGROUND_Y + 5) continue;

    // 3. 透视计算
    let distanceFactor = map(pos, VIRTUAL_HORIZON_Y, FOREGROUND_Y, 0, 1);
    distanceFactor = constrain(distanceFactor, 0, 1);
    
    // 2. 增大近处缩放比例 (增强近处透视深度/压缩感)
    let scale = lerp(0.1, 3.0, distanceFactor); // 从 2.5 增大到 3.0

    // 4. 尺寸和位置的透视变化
    let stripeHeight = baseStripeHeight * scale; 
    let baseLineWidth = 300; 
    let lineWidth = baseLineWidth * scale; 
    
    // 5. 实现对角线排列 (更斜、更陡峭)
    // 远端 x 更小 (0.05)，近端 x 更大 (0.95)，保持最大斜率
    let centerX = lerp(width * 0.05, width * 0.95, distanceFactor); 

    
    // 绘制每条水平的斑马线
    rect(centerX - lineWidth/2, pos, lineWidth, stripeHeight);
  }
  
  // === 人物背影 (如果不需要，可以移除) ===
  fill(50, 50, 80, 200); 
  push();
  translate(width * 0.5, height * 0.85); 
  ellipse(0, -40, 35, 45); // 头
  rect(-25, -40, 50, 80, 8); // 身体
  pop();
}

// === 控制移动的函数 ===
function keyPressed() {
  if (keyCode === 32) {
    isMoving = !isMoving;
    console.log("Movement Toggled: " + (isMoving ? "ON" : "OFF"));
  }
}