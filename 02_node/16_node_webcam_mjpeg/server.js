// Expanded Web
// NYUSH F25 - gohai

let express = require('express');
let webcam_mjpeg = require('./webcam_mjpeg');  // for streaming the webcam image
let app = express();
let port = 3000;

app.use(express.static('public'));


// ffmpeg has slightly different parameters
// between different operating systems:

if (process.platform == 'darwin') {
  // for macOS

  let options = [
    '-f', 'avfoundation',
    '-framerate', '30',                      // needed
    '-video_size', '1280x720',               // optional: 1920x1080, 640x480 (default: largest)
    '-i', 'default',                         // which camera device (0, 1, ..)
    '-filter:v', 'fps=10',                   // optional: change framerate
    // '-filter:v', 'fps=10,scale=640x360',  // optional: resize output
    '-q:v', '7',                             // optional: quality (1=best, 31=worst)
  ];

  webcam_mjpeg(app, '/stream.mjpeg', options);

} else if (process.platform == 'win32') {
  // for Windows

  let options = [
    '-f', 'dshow',
    '-framerate', '30',
    '-video_size', '1280x720',               // optional: 1920x1080, 640x480 (default: largest)
    '-i', 'default',                         // which camera device (0, 1, ..)
    '-filter:v', 'fps=10',                   // optional: change framerate
    // '-filter:v', 'fps=10,scale=640x360',  // optional: resize output
    '-q:v', '7',                             // optional: quality (1=best, 31=worst)
  ];

  webcam_mjpeg(app, '/stream.mjpeg', options);

} else {
  console.error('Unsupported OS:', process.platform);
}


app.listen(port, '0.0.0.0', function() {
  console.log('Example app listening on port ' + port);
});
