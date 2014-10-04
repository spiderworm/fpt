var PlayerSkin = require('./PlayerSkin');
var ClientPlayer = require('./ClientPlayer');
var libs = require('../lib/sharedLibs');
var THREE = libs.THREE;
var ClientGameItem = require('../gameItem/ClientGameItem');


var lastMesh;

function InstantPlayer(entityID,initialPosition,img,skinOpts) {

  window.player = this;

  var playerSkin = new PlayerSkin(THREE,img,skinOpts);
  var mesh = playerSkin.mesh;
  lastMesh = mesh;
  mesh.useQuaternion = true;

  ClientPlayer.apply(this,[
    entityID,
    null,
    mesh
  ]);

  this.mesh.avatar = this;
  this.mesh.yaw = this.mesh;
  this.mesh.pitch = this.mesh.head;

}

ClientPlayer.subclass(InstantPlayer);

InstantPlayer.deserialize = function(vals) {
  return new InstantPlayer(null,[0,0,0],"",{});
}







function Arm(mesh) {
    ClientGameItem.apply(
        this,
        [
            null,
            null,
            mesh
        ]
    );
}

ClientGameItem.subclass(Arm);
ClientGameItem.types.add('PlayerArm',Arm);

Arm.deserialize = function(vals) {
  var armMesh = lastMesh.children[0].children[1];
  return new Arm(armMesh);
}



module.exports = InstantPlayer;
