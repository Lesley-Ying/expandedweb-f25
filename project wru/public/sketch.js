let x;
let y;
let bgIsblack=true;
let size=100;
let changeSize=50;
//sound trigger:
//color change
//if you're close to each other
//how can you see yourself in others' eyes:if close, show stroke?
function setup() {
  createCanvas(windowWidth, windowHeight);
  x=width/2;
  y=height/2;
  bgcolor=color(0);
  holeColor=color(255);
}

function draw() {
  background(bgcolor);
  if(bgIsblack){
    bgcolor=color(0);
    holeColor=color(255);
  }else{
    bgcolor=color(255);
    holeColor=color(0);
  }
  noCursor();
  
   let distance=dist(mouseX,mouseY,x,y);
  if(distance<1){
    bgIsblack=!bgIsblack;
   size+=changeSize;
    if(size>=450){
      changeSize*=-1;
    }else if(size<=100){
changeSize*=-1;
    }
    
    console.log(size)
    x=random(0,width);
    y=random(0,height);
  }
  noStroke();
  fill(holeColor);
  circle(x,y,size);
  fill(bgcolor);
  circle(mouseX,mouseY,size);
  
}