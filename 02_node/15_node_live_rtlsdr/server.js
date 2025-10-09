// Expanded Web
// NYUSH F25 - gohai

let express = require('express');
let http = require('node:http');
let rtljs = require('rtljs');  // to interface with the sdr device
let socketIo = require('socket.io');

let app = express();
let server = http.createServer(app);
let io = new socketIo.Server(server);
let port = 3000;

app.use(express.static('public'));


// Radio
if (rtljs.getDeviceCount() == 0) {
  console.error('No RTL-SDR device detected');
  process.exit(1);
}
console.log('Will try to open:', rtljs.getDeviceName(0));
let device = rtljs.open(0);
device.setCenterFreq(902.5 * rtljs.mhz);
setInterval(function() {
  let data = device.readSync(512);  // this could probably read more data points (up to 2048?)
  //console.log(data);
  io.emit('data', data);
}, 100);  // this could probably run faster too

io.on('connection', function(socket) {
  console.log(socket.id + ' connected from ' + socket.handshake.address);

  socket.on('disconnect', function(reason) {
    console.log(socket.id + ' disconnected');
  });

  socket.on('setCenterFreq', function(freq) {
    console.log('Setting center frequency to ' + freq + ' MHz');
    device.setCenterFreq(freq * rtljs.mhz);
  });
});

server.listen(port, '0.0.0.0', function() {
  console.log('Example app listening on port ' + port);
});


// The radio needs to be properly closed whenever
// the program exits. This is a bit awkward to do
// in Node.js:

process.on('SIGINT', cleanupAndQuit);
process.on('SIGTERM', cleanupAndQuit);
process.on('unhandledRejection', function(reason, promise) {
  console.error('Unhandled Rejection:', reason);
  cleanupAndQuit();
});
process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception:', err);
  cleanupAndQuit();
});

function cleanupAndQuit() {
  if (device) {
    console.log('Closing RTL-SDR');
    rtljs.close(device);
  }
  process.exit();
}
