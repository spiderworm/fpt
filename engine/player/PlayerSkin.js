var skin = require('minecraft-skin');

function PlayerSkin(THREE,img,opts) {
  if (!opts) {
    opts = {};
  }
  opts.scale = opts.scale || new THREE.Vector3(0.04, 0.04, 0.04);
  var playerSkin = skin(THREE,img,opts);
  return playerSkin;
}

module.exports = PlayerSkin;