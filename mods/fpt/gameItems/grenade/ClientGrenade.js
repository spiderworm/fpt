var Engine = require('../../clientEngine');

function ClientGrenade() {
  var view = new Engine.THREE.Mesh(
    new Engine.THREE.SphereGeometry(.2,32,32),
    new Engine.THREE.MeshBasicMaterial({color: 0x66aa99})
  );
  Engine.Client.GameItem.apply(this,[null,null,view]);
}

Engine.Client.GameItem.subclass(ClientGrenade);
Engine.Client.GameItem.types.add("grenade",ClientGrenade);

ClientGrenade.deserialize = function() {
  return new ClientGrenade();
}

module.exports = ClientGrenade;
