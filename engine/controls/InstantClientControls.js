var Stream = require('stream').Stream;
var Controls = require('./Controls');

var max = Math.max
, min = Math.min
, sin = Math.sin
, abs = Math.abs
, floor = Math.floor
, PI = Math.PI;

function InstantControls(connection, state, opts) {
  Controls.apply(this,[connection]);

  opts = opts || {};

  this.state = state;
  this._pitch_target = 
  this._yaw_target =
  this._roll_target =
  this._target = null;

  this.x_rotation_per_ms = opts.rotationXMax || opts.rotationMax || 33;
  this.y_rotation_per_ms = opts.rotationYMax || opts.rotationMax || 33;
  this.z_rotation_per_ms = opts.rotationZMax || opts.rotationMax || 33;

  this.x_rotation_clamp = opts.rotationXClamp || Math.PI / 2;
  this.y_rotation_clamp = opts.rotationYClamp || Infinity;
  this.z_rotation_clamp = opts.rotationZClamp || 0;

  this.rotation_scale = opts.rotationScale || 0.002;

  this.air_control = 'airControl' in opts ? opts.airControl : true;

  this.state.x_rotation_accum =
  this.state.y_rotation_accum = 
  this.state.z_rotation_accum = 0.0;

  this.readable =
  this.writable = true;

  this.buffer = [];
  this.paused = false;

  var controls = this;

  function sendButtons() {
    requestAnimationFrame(sendButtons);
    controls._sendButtons();
  }

  sendButtons();

}

Controls.subclass(InstantControls);

Object.defineProperty(InstantControls.prototype,'target',{
  get: function() {
    return this._target;
  },
  set: function(gameItem) {
    this.setTarget(gameItem);
  }
});

InstantControls.prototype.setTarget = function(gameItem) {
  if(gameItem) {
    this._target = gameItem.view;
    this._yaw_target = gameItem.view.yaw || gameItem.view;
    this._pitch_target = gameItem.view.pitch || gameItem.view;
    this._roll_target = gameItem.view.roll || gameItem.view;
  }
}

InstantControls.prototype.setMouseRotationStream = function(inputRotationStream) {
  var controls = this;
  inputRotationStream.pipe(this.createWriteRotationStream());
  inputRotationStream.on('data',function(data) {
    controls._sendOrientation(data);
  });
}

InstantControls.prototype.tick = function() {
  if(!this._target) {
    return;
  }
  var state = this.state
    , target = this._target;

  var x_rotation = this.state.x_rotation_accum * this.rotation_scale
    , y_rotation = this.state.y_rotation_accum * this.rotation_scale
    , z_rotation = this.state.z_rotation_accum * this.rotation_scale
    , pitch_target = this._pitch_target
    , yaw_target = this._yaw_target
    , roll_target = this._roll_target
    
  if (pitch_target === yaw_target && yaw_target === roll_target) {
    pitch_target.eulerOrder = 'YXZ'
  }

  pitch_target.rotation.x = clamp(pitch_target.rotation.x + clamp(x_rotation, this.x_rotation_per_ms), this.x_rotation_clamp)
  yaw_target.rotation.y = clamp(yaw_target.rotation.y + clamp(y_rotation, this.y_rotation_per_ms), this.y_rotation_clamp)
  roll_target.rotation.z = clamp(roll_target.rotation.z + clamp(z_rotation, this.z_rotation_per_ms), this.z_rotation_clamp)

  if(this.listeners('data').length) {
    this.emitUpdate()
  }

  this.state.x_rotation_accum =
  this.state.y_rotation_accum =
  this.state.z_rotation_accum = 0
}

InstantControls.prototype._sendButtons = function() {
  if(this._target) {
    var buttons = this.state.getUpdate();
    if(buttons) {
      var update = {
        movement: buttons
      };
      this._connection.emit('player.control',update);
    }
  }
}

InstantControls.prototype._sendOrientation = function(rotationInput) {
  if(this._target) {
    this._connection.emit('player.control',{
      rotationInput: rotationInput,
      rotation: {
        yaw: this._target.yaw.rotation.y,
        pitch: this._target.pitch.rotation.x
      }
    });
  }
}

InstantControls.prototype.createWriteRotationStream = function() {
  var state = this.state
    , stream = new Stream

  state.x_rotation_accum =
  state.y_rotation_accum =
  state.z_rotation_accum = 0

  stream.writable = true
  stream.write = write
  stream.end = end

  return stream

  function write(changes) {
    state.x_rotation_accum -= changes.dy || 0
    state.y_rotation_accum -= changes.dx || 0
    state.z_rotation_accum += changes.dz || 0
  }

  function end(deltas) {
    if(deltas) {
      stream.write(deltas)
    }
  }
}

function clamp(value, to) {
  return isFinite(to) ? max(min(value, to), -to) : value
}

module.exports = InstantControls;
