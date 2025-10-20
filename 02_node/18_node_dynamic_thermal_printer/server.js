// Expanded Web
// NYUSH F25 - gohai

let escpos = require('escpos');      // to use the printer
escpos.USB = require('escpos-usb');  // to use the printer
let express = require('express');
let fs = require('node:fs');
let app = express();
let port = 3000;

app.use(express.static('public'));
app.use(express.json());


// there are two generation of devices
// floating around IMA: this is the older
// model of the DELI DL-5801PW printer
let device = new escpos.USB(0x0483, 0x5720);

// this is the newer, more boxy looking one
// (unfortunately with the same model number)
//let device = new escpos.USB(0x09c5, 0x0668);

let printer = new escpos.Printer(device);


app.post('/message', function(req, res) {
  console.log(req.body);
  let message = req.body;

  try {
    device.open(function(err) {
      // There are more things we could do here,
      // e.g. print images, QR codes and more
      // see https://github.com/lsongdev/node-escpos?tab=readme-ov-file#example
      printer.feed(3);
      printer.align('ct');
      printer.text(message.text);
      printer.cut().close();
      res.end();
    });
  } catch (e) {
    console.warn('Printing error: ' + e);
  }
});

app.listen(port, '0.0.0.0', function() {
  console.log('Example app listening on port ' + port);
});
