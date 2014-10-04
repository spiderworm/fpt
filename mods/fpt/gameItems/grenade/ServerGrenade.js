var Engine = require('../../serverEngine');

function ServerGrenade() {
  var shape = new Engine.CANNON.Sphere(5);
  var physics = new Engine.CANNON.RigidBody(1,shape);
  physics.position.set(0,0,0);

  Engine.Server.GameItem.apply(this,[null,physics,null]);
}

Engine.Server.GameItem.subclass(ServerGrenade);
Engine.Server.GameItem.types.add("grenade",ServerGrenade);

module.exports = ServerGrenade;
