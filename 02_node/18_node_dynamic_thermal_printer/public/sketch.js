// Expanded Web
// NYUSH F25 - gohai

let inputEl;

function setup() {
  noCanvas();

  inputEl = createInput();
  let buttonEl = createButton('Submit');
  buttonEl.mouseClicked(postMessage);
}

function draw() {
}

function postMessage() {
  // you could put any additional data into this object
  // to be sent to the backend and stored there
  message = {
    text: inputEl.value(),
  };

  // this sends a HTTP POST request to /message
  httpPost('/message', 'json', message);
  inputEl.value('');
}
