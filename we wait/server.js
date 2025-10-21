// Expanded Web
// NYUSH F25 - gohai

let express = require('express');
let http = require('node:http');
let { SerialPort } = require('serialport');
let socketIo = require('socket.io');
let webcam_mjpeg = require('./webcam_mjpeg');

let app = express();
let server = http.createServer(app);
let io = new socketIo.Server(server);
let pointers = {};
let port = 3000;
let arduino = null;

app.use(express.static('public'));

tryConnectArduino();

io.on('connection', function(socket) {
  console.log(socket.id + ' connected from ' + socket.handshake.address);

  socket.on('disconnect', function(reason) {
    console.log(socket.id + ' disconnected');
    delete pointers[socket.id];
  });

  socket.on('mousemove', function(data) {
    data.ip = socket.handshake.address;
    socket.broadcast.emit('mousemove', data);
    
    // 如果有之前的位置，计算移动距离
    if (pointers[data.id]) {
      let dx = data.x - pointers[data.id].x;
      let dy = data.y - pointers[data.id].y;
      data.distance = Math.sqrt(dx * dx + dy * dy);
    } else {
      data.distance = 0;
    }
    
    pointers[data.id] = data;
    pointers[data.id].lastSeen = Date.now();
  });
});

// 计算平均移动距离，更新LED
function updateLED() {
  let totalDistance = 0;
  let count = 0;

  for (let id in pointers) {
    if (Date.now() - pointers[id].lastSeen > 3000) {
      delete pointers[id];
    } else {
      totalDistance += pointers[id].distance || 0;
      count++;
    }
  }

  let delayTime;
  let avgDistance = 0;
  
  if (count > 0) {
    avgDistance = totalDistance / count;
    // 移动量大 -> delay小 -> 闪得快
    delayTime = map(avgDistance, 0, 50, 2000, 50);
    delayTime = constrain(delayTime, 50, 2000);
    console.log('平均移动:', avgDistance.toFixed(1), 'delay:', delayTime);
  } else {
    delayTime = 1000;
  }

  if (arduino && arduino.isOpen) {
    arduino.write(Math.floor(delayTime) + '\n');
  }
  
  // 发送平均移动速度给所有客户端
  io.emit('avgMovement', avgDistance);
}

setInterval(updateLED, 100);

function map(value, start1, stop1, start2, stop2) {
  return start2 + (value - start1) * (stop2 - start2) / (stop1 - start1);
}

function constrain(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Webcam
if (process.platform == 'darwin') {
  let options = [
    '-f', 'avfoundation',
    '-framerate', '30',
    '-video_size', '1280x720',
    '-i', 'default',
    '-filter:v', 'fps=10,scale=640x360',
    '-q:v', '7',
  ];
  webcam_mjpeg(app, '/stream.mjpeg', options);
} else if (process.platform == 'win32') {
  let options = [
    '-f', 'dshow',
    '-framerate', '30',
    '-video_size', '1280x720',
    '-i', '0',
    '-filter:v', 'fps=10,scale=640x360',
    '-q:v', '7',
  ];
  webcam_mjpeg(app, '/stream.mjpeg', options);
}

server.listen(port, '0.0.0.0', function() {
  console.log('Example app listening on port ' + port);
});

async function tryConnectArduino(baudRate = 57600) {
  if (arduino && arduino.isOpen) return;
  try {
    let port = await getArduino();
    if (port) {
      arduino = new SerialPort({
        path: port.path,
        baudRate: baudRate,
      }, function(err) {
        if (err) console.error(err.message);
      });
      console.log('Arduino connected');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

async function getArduino() {
  let ports = await SerialPort.list();
  for (port of ports) {
    if (port.vendorId == '2341' || port.vendorId == '3343')
      return port;
  }
  return null;
}