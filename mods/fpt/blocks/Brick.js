
var Block = require('../../../engine/block/Block');

function Brick() {
  var settings = {
    indestructible: true
  };

  Block.apply(this,[3,"brick.png",settings]);


}

Block.subclass(Brick);

Brick.id = 3;
Brick.texture = "brick.png";
Brick.indestructible = 

module.exports = Brick;
