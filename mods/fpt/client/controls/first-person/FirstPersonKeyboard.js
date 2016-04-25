
import System from '../../../game/ecs/System';
import Buttons from '../../controls/Buttons';

function acceleration(current, max) {
  var pct = (max - current) / max;
  return Math.sin(Math.PI/2*pct);
}

var FirstPersonKeyboard = System.createClass({
  constructor: function (opts) {

    opts = opts || {};

    this.buttons = new Buttons(
      document.body,
      {
        '<left>': 'left',
        '<right>': 'right',
        '<up>': 'forward',
        '<down>': 'backward',
        'W': 'forward',
        'A': 'left',
        'S': 'backward',
        'D': 'right',
        '<mouse 1>': 'fire',
        '<space>': 'jump'
      }
    );

    var scale = 1000;

    this._target = null;
    this.speed = opts.speed || 0.0032 * scale;
    this.max_speed = opts.maxSpeed || 0.0112 * scale;
    this.walk_max_speed = opts.walkMaxSpeed || this.max_speed;
    this.run_max_speed = opts.runMaxSpeed || 0.0224 * scale;
    this.sneak_max_speed = opts.sneakMaxSpeed || 0.0056 * scale;
    this.jump_max_speed = opts.jumpMaxSpeed || 0.016 * scale;
    this.jump_max_timer = opts.jumpTimer || 200;
    this.jump_speed = opts.jumpSpeed || 0.004;
    this.jump_timer = this.jump_timer_max;
    this.jumping = false;
    this.jump_speed_move = 1;
    this.z_accel_timer = this.accel_max_timer;

    this.fire_rate = opts.fireRate || 0;
    this.needs_discrete_fire = opts.discreteFire || false;
    this.firing = 0;

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

    this.accel_max_timer = opts.accelTimer || 200;
    this.x_accel_timer = this.accel_max_timer;
    this.z_accel_timer = this.accel_max_timer;

    var controls = this;

    function sendButtons() {
      requestAnimationFrame(sendButtons);
      controls._sendButtons();
    }

    sendButtons();

  }
});

FirstPersonKeyboard.prototype.setTarget = function(entity) {
  if (entity) {
    this._target = entity;
  }
}

FirstPersonKeyboard.prototype.tick = function(dt) {

  this.tickSubsystems(dt);

  if(!this._target) {
    return;
  }

  var physics = this._target.get('physics');

  if (!physics) {
    return;
  }

  var buttons = this.buttons
    , speed = this.speed
    , jump_speed = this.jump_speed
    , jump_speed_move = this.jump_speed_move
    , max_speed = this.buttons.sprint ? this.run_max_speed : (this.buttons.crouch ? this.sneak_max_speed : this.walk_max_speed)
    , at_rest = true // target.atRestY()

  var move_speed = speed
  if (physics.velocity.y !== 0) move_speed = move_speed * jump_speed_move

  if(buttons.forward || buttons.backward) {
    this.z_accel_timer = Math.max(0, this.z_accel_timer - dt);
  }
  if(buttons.backward) {
    if(physics.velocity.z < max_speed) {
      physics.velocity.z = Math.max(Math.min(max_speed, move_speed * dt * acceleration(this.z_accel_timer, this.accel_max_timer)), physics.velocity.z);
    }
  } else if(buttons.forward) {
    if(physics.velocity.z > -max_speed) {
      physics.velocity.z = Math.min(Math.max(-max_speed, -move_speed * dt * acceleration(this.z_accel_timer, this.accel_max_timer)), physics.velocity.z);
    }
    //console.info(physics.velocity.z);
  } else {
    this.z_accel_timer = this.accel_max_timer;
  }
 
  if(buttons.left || buttons.right) {
    this.x_accel_timer = Math.max(0, this.x_accel_timer - dt)
  }

  if(buttons.right) {
    if(physics.velocity.x < max_speed)
      physics.velocity.x = Math.max(Math.min(max_speed, move_speed * dt * acceleration(this.x_accel_timer, this.accel_max_timer)), physics.velocity.x)
  } else if(buttons.left) {
    if(physics.velocity.x > -max_speed)
      physics.velocity.x = Math.min(Math.max(-max_speed, -move_speed * dt * acceleration(this.x_accel_timer, this.accel_max_timer)), physics.velocity.x)
  } else {
    this.x_accel_timer = this.accel_max_timer
  }

  if(buttons.jump) {
    if(!this.jumping && !at_rest) {
      // we're falling, we can't jump
    } else if(at_rest > 0) {
      // we hit our head
      this.jumping = false
    } else {
      this.jumping = true
      if(this.jump_timer > 0) {
        physics.velocity.y = Math.min(physics.velocity.y + jump_speed * min(dt, this.jump_timer), this.jump_max_speed)
      }
      this.jump_timer = Math.max(this.jump_timer - dt, 0)
    }
  } else {
    this.jumping = false
  }
  this.jump_timer = at_rest < 0 ? this.jump_max_timer : this.jump_timer

  var can_fire = true

  if(buttons.fire || buttons.firealt) {
    if(this.firing && this.needs_discrete_fire) {
      this.firing += dt
    } else {
      if(!this.fire_rate || floor(this.firing / this.fire_rate) !== floor((this.firing + dt) / this.fire_rate)) {
        //this.onfire(buttons)
      }
      this.firing += dt
    }
  } else {
    this.firing = 0
  }

};

FirstPersonKeyboard.prototype._sendButtons = function() {
  if(this._target) {
    var buttons = this.buttons.getUpdate();
    if(buttons) {
      var update = {
        movement: buttons
      };
      //console.log(buttons);
      //this._connection.emit('player.control',update);
    }
  }
};

export default FirstPersonKeyboard;
