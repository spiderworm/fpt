
import System from '../../../game/ecs/System';
import {Stream} from 'stream';
import interact from 'interact';
import Rotation from '../../../game/physics/Rotation';
import RotationEuler from '../../../game/physics/RotationEuler';

function clamp(value, to) {
  return isFinite(to) ? Math.max(Math.min(value, to), -to) : value
}

var FirstPersonMouse = System.createClass({
  constructor: function (opts) {
    opts = opts || {};

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

    this.x_rotation_accum =
    this.y_rotation_accum = 
    this.z_rotation_accum = 0.0;

    interact(document.body).on('attain', function(inputRotationStream) {
      this.setMouseRotationStream(inputRotationStream);
    }.bind(this));

  }
});

FirstPersonMouse.prototype.setTargets = function(entity, yawEntity, pitchEntity, rollEntity) {
  this._target = entity;
  this._yaw_target = yawEntity || this._target;
  this._pitch_target = pitchEntity || this._target;
  this._roll_target = rollEntity || this._target;
};

FirstPersonMouse.prototype.setMouseRotationStream = function(inputRotationStream) {
  inputRotationStream.pipe(this.createWriteRotationStream());
  inputRotationStream.on('data',function(data) {
    this._sendOrientation(data);
  }.bind(this));
};

FirstPersonMouse.prototype.tick = function(dt) {
  this.tickSubsystems(dt);

  if (!this._pitch_target || !this._yaw_target || !this._roll_target) {
    return;
  }

  var targets = {
    x: this._pitch_target.get('physics'),
    y: this._yaw_target.get('physics'),
    z: this._roll_target.get('physics')
  };

  if (!targets.x || !targets.y || !targets.z) {
    return;
  }

  ['x', 'y', 'z'].forEach(function(dim) {

    if (this[dim + '_rotation_accum']) {

      var target = targets[dim].rotation;
      var euler = RotationEuler.fromVector4(target);
      euler[dim] = clamp(
        euler[dim] + clamp(
          this[dim + '_rotation_accum'] * this.rotation_scale,
          this[dim + '_rotation_per_ms']
        ),
        this[dim + '_rotation_clamp']
      );
      target.setFromEuler(euler);

    }

  }.bind(this));

  this.x_rotation_accum =
  this.y_rotation_accum =
  this.z_rotation_accum = 0;
};

FirstPersonMouse.prototype._sendOrientation = function(rotationInput) {
  if(this._target) {
    //console.log(rotationInput);
    /*
    this._connection.emit('player.control',{
      rotationInput: rotationInput,
      rotation: {
        yaw: this._target.yaw.rotation.y,
        pitch: this._target.pitch.rotation.x
      }
    });
    */
  }
};

FirstPersonMouse.prototype.createWriteRotationStream = function() {

  var write = function(changes) {
    this.x_rotation_accum -= changes.dy || 0
    this.y_rotation_accum -= changes.dx || 0
    this.z_rotation_accum += changes.dz || 0
  }.bind(this);

  var state = this.state
    , stream = new Stream

  this.x_rotation_accum =
  this.y_rotation_accum =
  this.z_rotation_accum = 0

  stream.writable = true
  stream.write = write
  stream.end = end

  return stream

  function end(deltas) {
    if(deltas) {
      stream.write(deltas)
    }
  }
};

module.exports = FirstPersonMouse;
