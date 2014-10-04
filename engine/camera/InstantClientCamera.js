
var GameItem = require('../gameItem/GameItem');

function Camera(threeCamera) {
  GameItem.apply(this,['camera',null,threeCamera]);
  this._threeCamera = threeCamera;
  this._target = null;
  this._pov = 1;
}

GameItem.subclass(Camera);

Camera.prototype.pov = function (type,target) {
  if (type === 'first' || type === 1) {
    this._pov = 1;
  }
  else if (type === 'third' || type === 3) {
    this._pov = 3;
  }
  this.possess(target);
}

Camera.prototype.toggle = function () {
  this.pov(this._pov === 1 ? 3 : 1);
}

Camera.prototype.possess = function (target) {
  if(target) {
    this._target = target;
  }
  if(this._threeCamera.parent) {
    this._threeCamera.parent.remove(this._threeCamera);
  }
  var key = this._pov === 1 ? 'cameraInside' : 'cameraOutside';
  var mesh = this._target.mesh[key] || this._target.mesh;
  if(mesh) {
    mesh.add(this._threeCamera);
  }
}

module.exports = Camera;