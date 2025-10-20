// Expanded Web
// NYUSH F25 - gohai

// This example combines various earlier sketches
// to make all users on the website collectively
// move a servo motor (visible via webcam).

// An Arduino board is expected to be present,
// programmed with the example code for controlling
// a servo motor through the Serial port (code is
// in the "arduino" subdirectory).

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
  });

  socket.on('mousemove', function(data) {
    //console.log(socket.id, data);
    data.ip = socket.handshake.address;
    socket.broadcast.emit('mousemove', data);
    pointers[data.id] = data;
    // Date.now() is the general JavaScript way of saying millis()
    pointers[data.id].lastSeen = Date.now();
  });
});


// Every so often, the updateServo function below
// gets run. It looks through all the mouse pointer
// positions received, discards the ones that are
// too old, and calculates the average x position
// from the remaining ones. The result is mapped
// to angles (e.g. 0-180), and sent to the connected
// Arduino, which makes the servo motor move accordingly.

function updateServo() {
  let sumX = 0;
  let numPointers = 0;

  for (let id in pointers) {
    if (Date.now() - pointers[id].lastSeen > 3000) {
      delete pointers[id];
    } else {
      sumX = sumX + pointers[id].x;
      numPointers++;
    }
  }

  if (numPointers > 0) {
    let avgX = sumX / numPointers;
    let angle = map(avgX, 0, 640, 0, 180);
    angle = Math.floor(angle);
    console.log('Angle:', angle, 'degrees');
    if (arduino) {
      arduino.write(angle + '\n');
    }
  }
}

// this makes updateServo run every 20 ms (50 times per second)
setInterval(updateServo, 20);

// a helper function for p5-style map()
function map(value, start1, stop1, start2, stop2) {
  let ratio = (value - start1) / (stop1 - start1);
  let mapped = start2 + ratio * (stop2 - start2);
  return mapped;
}


// We can optionally send the connected users messages to
// try to synchronize their movements.

let lastInstruction;

function sendInstruction() {
  if (lastInstruction == 'Move left') {
    lastInstruction = 'Move right';
  } else {
    lastInstruction = 'Move left';
  }
  // we can sent events to all connected clients
  // by calling emit() on the io object
  io.emit('instruction', lastInstruction);
}

setInterval(sendInstruction, 3000);


// Webcam

if (process.platform == 'darwin') {
  // for macOS
  let options = [
    '-f', 'avfoundation',
    '-framerate', '30',                      // needed
    '-video_size', '1280x720',               // optional: 1920x1080, 640x480 (default: largest)
    '-i', 'default',                         // which camera device (0, 1, ..)
    //'-filter:v', 'fps=10',                 // optional: change framerate
    '-filter:v', 'fps=10,scale=640x360',     // optional: resize output
    '-q:v', '7',                             // optional: quality (1=best, 31=worst)
  ];
  webcam_mjpeg(app, '/stream.mjpeg', options);
} else if (process.platform == 'win32') {
  // for Windows
  let options = [
    '-f', 'dshow',
    '-framerate', '30',
    '-video_size', '1280x720',               // optional: 1920x1080, 640x480 (default: largest)
    '-i', '0',                               // which camera device (0, 1, ..)
    // '-filter:v', 'fps=10',                // optional: change framerate
    '-filter:v', 'fps=10,scale=640x360',     // optional: resize output
    '-q:v', '7',                             // optional: quality (1=best, 31=worst)
  ];
  webcam_mjpeg(app, '/stream.mjpeg', options);
} else {
  console.error('Unsupported OS:', process.platform);
}


server.listen(port, '0.0.0.0', function() {
  console.log('Example app listening on port ' + port);
});


/*
 * Helper functions for talking to Arduino
 */

async function tryConnectArduino(baudRate = 57600) {
  if (arduino && arduino.isOpen) {
    return;  // port is already open
  }
  try {
    let port = await getArduino();
    if (port) {
      arduino = new SerialPort({
        path: port.path,
        baudRate: baudRate,
      }, function(err) {
        if (err) {
          console.error(err.message);
        }
      });
      console.log('Opening connection with Arduino serial number ' + port.serialNumber);
    }
  } catch (e) {
    console.error('Error opening Arduino:', e);
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
