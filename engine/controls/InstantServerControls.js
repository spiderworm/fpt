
var Controls = require('./Controls');
var libs = require('../lib/sharedLibs');
var THREE = libs.THREE;

function InstantControls(connection, buttons, opts) {
  Controls.call(this,[connection]);

  THREE = libs.THREE;

  var controls = this;

  connection.on('player.control',function(commands) {
    if(commands.rotation) {
      var quat = new THREE.Quaternion(0,0,0,0);
      var euler = new THREE.Vector3(0,commands.rotation.yaw,0);
      quat.setFromEuler(euler,"YXZ");
      controls._target.quaternion.set(
        quat.x,
        quat.y,
        quat.z,
        quat.w
      );
    }

    if(commands.movement) {
      controls.write(commands.movement);
    }
  });




  this.state = buttons;

  this._vel = new THREE.Vector3();
  this._vel.run = 0;
  this._vel.strafe = 0;

  this._runControl = true;

  this._quat1 = new THREE.Quaternion(0,0,0,0);
  this._quat2 = new THREE.Quaternion(0,0,0,0);
  this._vec1 = new THREE.Vector3(0,0,0);

  opts = opts || {}

  this.speed = opts.speed || 50
  this.walk_max_speed = opts.walkMaxSpeed || 5.6
  this.run_max_speed = opts.runMaxSpeed || 0.112
  this.sneak_max_speed = opts.sneakMaxSpeed || 0.014
  this.jump_max_speed = opts.jumpMaxSpeed || 0.16
  this.jump_max_timer = opts.jumpTimer || 200
  this.jump_speed = opts.jumpSpeed || 0.04
  this.jump_speed_move = opts.jumpSpeedMove || 1
  this.jump_timer = 0
  this.jumping = false
  this.acceleration = opts.accelerationCurve || this.acceleration

  this.fire_rate = opts.fireRate || 0
  this.needs_discrete_fire = opts.discreteFire || false
  this.onfire = opts.onfire || this.onfire
  this.firing = 0

  this.x_rotation_per_ms = opts.rotationXMax || opts.rotationMax || 33
  this.y_rotation_per_ms = opts.rotationYMax || opts.rotationMax || 33
  this.z_rotation_per_ms = opts.rotationZMax || opts.rotationMax || 33

  this.x_rotation_clamp = opts.rotationXClamp || Math.PI / 2
  this.y_rotation_clamp = opts.rotationYClamp || Infinity
  this.z_rotation_clamp = opts.rotationZClamp || 0

  this.rotation_scale = opts.rotationScale || 0.002

  this.air_control = 'airControl' in opts ? opts.airControl : true

  this.state.x_rotation_accum =
  this.state.y_rotation_accum = 
  this.state.z_rotation_accum = 0.0

  this.accel_max_timer = opts.accelTimer || 200
  this.x_accel_timer = this.accel_max_timer+0
  this.z_accel_timer = this.accel_max_timer+0

  this.readable =
  this.writable = true

  this.buffer = []
  this.paused = false
}

Controls.subclass(InstantControls);

var max = Math.max
  , min = Math.min
  , sin = Math.sin
  , abs = Math.abs
  , floor = Math.floor
  , PI = Math.PI;

InstantControls.prototype.setTarget = function(gameItem) {
  this._target = gameItem;
  this._yaw_target = gameItem.yaw || gameItem;
  this._pitch_target = gameItem.pitch || gameItem;
  this._roll_target = gameItem.roll || gameItem;
}

InstantControls.prototype.tick = function(dt) {

  if(!this._target) {
    return
  }

  this._tickRotation(dt);
  this._tickMovement(dt);
  this._tickFiring(dt);

  if(this.listeners('data').length) {
    this.emitUpdate()
  }

  this.state.x_rotation_accum =
  this.state.y_rotation_accum =
  this.state.z_rotation_accum = 0

}

InstantControls.prototype._tickMovement = function(dt) {

  if(this._runControl) {
    var rot = this._vec1;
    rot.setEulerFromQuaternion(this._target.quaternion,"YXZ");
    rot.x = rot.z = 0;

    var state = this.state;
    var target = this._target.physics;
    var speed = this.speed;
    var max_speed = this.state.sprint ? this.run_max_speed : (
      this.state.crouch ? this.sneak_max_speed : this.walk_max_speed
    );
    var at_rest = target.velocity.y === 0;

    var vel = this._vel;

    var move_speed = speed

    var accel = {
      total: move_speed * dt / this.accel_max_timer,
      run: 0,
      strafe: 0
    };

    if(
      (!state.forward && !state.backward) ||
      (state.forward && state.backward)
    ) {
      vel.run = 0;
    }

    if(
      (!state.left && !state.right) ||
      (state.left && state.right)
    ) {
      vel.strafe = 0;
    }

    if(state.forward && !state.backward) {
      accel.run -= accel.total;
    }

    if(state.backward && !state.forward) {
      accel.run += accel.total;
    }

    if(state.right && !state.left) {
      accel.strafe += accel.total;
    }

    if(state.left && !state.right) {
      accel.strafe -= accel.total;
    }

    var totalAccel = Math.sqrt((accel.strafe * accel.strafe) + (accel.run * accel.run));
    if(totalAccel > accel.total) {
      var modifier = accel.total / totalAccel;
      accel.run *= modifier;
      accel.strafe *= modifier;
    }

    vel.run += accel.run;
    vel.strafe += accel.strafe;

    var totalVel = Math.sqrt((vel.strafe * vel.strafe) + (vel.run * vel.run));
    if(totalVel > move_speed) {
      var modifier = move_speed / totalVel;
      vel.run *= modifier;
      vel.strafe *= modifier;
    }

    vel.z = vel.run;
    vel.x = vel.strafe;

    vel.applyEuler(rot,"YXZ");

    //localVelocity.applyQuaternion(unrotation);
    target.velocity.z = vel.z;
    //target.velocity.y = vel.y;
    target.velocity.x = vel.x;
  }
}

InstantControls.prototype._tickFiring = function(dt) {

  var state = this.state;

  if(state.fire || state.firealt) {
    if(this.firing && this.needs_discrete_fire) {
      this.firing += dt
    } else {
      if(!this.fire_rate || floor(this.firing / this.fire_rate) !== floor((this.firing + dt) / this.fire_rate)) {
        this.onfire(state)
      }
      this.firing += dt
    }
  } else {
    this.firing = 0
  }

}


InstantControls.prototype._tickRotation = function(dt) {
  this._target.physics.angularVelocity.set(0,0,0);
}

InstantControls.prototype.write = function(changes) {
  for(var key in changes) {
    this.state[key] = changes[key]
  }
}

InstantControls.prototype.end = function(deltas) {
  if(deltas) {
    this.write(deltas)
  }
}

InstantControls.prototype.emitUpdate = function() {
  return this.queue({
      x_rotation_accum: this.state.x_rotation_accum
    , y_rotation_accum: this.state.y_rotation_accum
    , z_rotation_accum: this.state.z_rotation_accum
    , forward: this.state.forward
    , backward: this.state.backward
    , left: this.state.left
    , right: this.state.right
    , fire: this.state.fire
    , firealt: this.state.firealt
    , jump: this.state.jump
  })
}

InstantControls.prototype.drain = function() {
  var buf = this.buffer
    , data

  while(buf.length && !this.paused) {
    data = buf.shift()
    if(null === data) {
      return this.emit('end')
    }
    this.emit('data', data)
  }
}

InstantControls.prototype.resume = function() {
  this.paused = false
  this.drain()

  if(!this.paused) {
    this.emit('drain')
  }
  return this
}

InstantControls.prototype.pause = function() {
  if(this.paused) return

  this.paused = true
  this.emit('pause')
  return this
}

InstantControls.prototype.queue = function(data) {
  this.buffer.push(data)
  this.drain()
  return this
}

InstantControls.prototype.acceleration = function(current, max) {
  // max -> 0
  var pct = (max - current) / max
  return sin(PI/2*pct)
}

InstantControls.prototype.onfire = function(_) {

}

function clamp(value, to) {
  return isFinite(to) ? max(min(value, to), -to) : value
}

module.exports = InstantControls;
