
var ServerGameItem = require('../gameItem/ServerGameItem');
var PlayerMixin = require('./PlayerMixin');
var ClientGameItem = require('../gameItem/ClientGameItem');
var GameItem = require('../gameItem/GameItem');

function ServerPlayer(id,physics,mesh) {

  ServerGameItem.apply(
    this,
    [
      id,
      physics,
      mesh
    ]
  );

}

ServerPlayer.prototype.wieldItem = function(item) {
  console.info('wielding',item.constructor.name);
  this.addItem(item);
}

ServerGameItem.subclass(ServerPlayer);
PlayerMixin.mixin(ServerPlayer);

module.exports = ServerPlayer;
