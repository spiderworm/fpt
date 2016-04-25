
var KeyboardControls = require('kb-controls');

function Buttons(domElement,map) {
  
  var states = {};

  for(var i in map) {
    states[map[i]] = true;
  }

  var buttons = new KeyboardControls(domElement,map);

  buttons.__states = states;
  buttons.__lastState = {};
  buttons.getUpdate = this.getUpdate;
  buttons.toObject = this.toObject;

  return buttons;
}

Buttons.prototype.toObject = function() {
  var result = {};
  for(var i in this.__states) {
    result[i] = this[i];
  }
  return result;
}

Buttons.prototype.getUpdate = function() {
  var current = this.toObject();
  var update = {};
  var updated = false;
  for(var i in current) {
    if(current[i] !== this.__lastState[i]) {
      updated = true;
      update[i] = current[i];
    }
  }
  if(updated) {
    this.__lastState = current;
    return update;
  }
  return null;
}

module.exports = Buttons;
