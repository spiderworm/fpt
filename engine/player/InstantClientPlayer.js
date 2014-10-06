var PlayerSkin = require('./PlayerSkin');
var ClientPlayer = require('./ClientPlayer');
var libs = require('../lib/sharedLibs');
var THREE = libs.THREE;
var ClientGameItem = require('../gameItem/ClientGameItem');
var InstantPlayerMixin = require('./InstantPlayerMixin');


var lastMesh;

function InstantPlayer(entityID,initialPosition,img,skinOpts) {

  InstantPlayerMixin.apply(this);
  /*
  var playerSkin = new PlayerSkin(THREE,img,skinOpts);
  var mesh = playerSkin.mesh;
  lastMesh = mesh;
  mesh.useQuaternion = true;
  */

  var geometry = new THREE.CubeGeometry(
    this._size[0],
    this._size[1],
    this._size[2]
  );
  var material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
  var mesh = new THREE.Mesh(geometry,material);

  var headGeometry = new THREE.CubeGeometry(
    this._headSize[0],
    this._headSize[1],
    this._headSize[2]
  );
  mesh.head = new THREE.Mesh(headGeometry,material);
  mesh.head.position.set(
    0,
    (this._size[1] * .5) + (this._headSize[1] * .5),
    0
  );
  mesh.add(mesh.head);

  mesh.cameraOutside = new THREE.Object3D();
  mesh.head.add(mesh.cameraOutside);
  mesh.cameraOutside.position.set(0,0,2);

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
InstantPlayerMixin.mixin(InstantPlayer);



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

  /*
  var armMesh = lastMesh.children[0].children[0].children[2].children[2];
  if(armMesh) {
    var armgeo = armMesh.geometry;
    for(var i=0; i < 8; i++) {
      armgeo.vertices[i].y += 4;
    }
    armMesh.scale.set(0.04, 0.04, 0.04);
  }
  */

  var geometry = new THREE.CubeGeometry(.16,.48,.16);
  var material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
  var mesh = new THREE.Mesh(geometry,material);

  return new Arm(mesh);
}



module.exports = InstantPlayer;
