// Expanded Web
// NYUSH F25 - gohai

let socket;

let lastData;
let minValueSeen = 255;
let maxValueSeen = 0;

function setup() {
  createCanvas(400, 400);
  background(255);

  socket = io();

  socket.on('data', function(data) {
    console.log('received', data);
    lastData = data;
  });
}

function draw() {
  // scroll what'so on the canvas down by one
  copy(0, 0, width, height, 0, 1, width, height);

  drawData();
}

function mousePressed() {
  let freq = map(mouseX, 0, width, 890, 915);
  console.log('Requesting ' + freq + ' MHz');
  socket.emit('setCenterFreq', freq);
}

function drawData() {
  // Note: I actually don't know how to properly interpret
  // these numbers, some research needed :)

  if (!lastData) {
    return;
  }

  // figure out how many numbers we actually got
  let numValues = 0;
  for (let i=0; i < lastData.length; i++) {
    if (lastData[i] === null) {
      numValues = i;
      break;
    }
  }

  // keep track of minimum and maximum values
  for (let i=0; i < numValues; i++) {
    if (lastData[i] > maxValueSeen) {
      maxValueSeen = lastData[i];
    }
    if (lastData[i] < minValueSeen) {
      minValueSeen = lastData[i];
    }
  }

  // color each pixel in the top row based
  // on the value of the data
  loadPixels();
  for (let x=0; x < width; x++) {
    let dataIndex = floor((x+1)/width * numValues);
    let value = lastData[dataIndex];
    let intensity = map(value, minValueSeen, maxValueSeen, 0, 1);
    set(x, 0, color(0, 0, intensity * 255));
  }
  updatePixels();
}
