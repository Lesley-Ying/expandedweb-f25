## Note

There is a bug in the published version of `escpos-usb`, which requires some manual change to a file in your `node_modules` (after installing the dependencies).

Open `node_modules/escpos-usb/index.js` and change line 52 from

```
  usb.on('detach', function(device){
```

to

```
  usb.usb.on('detach', function(device){
```
