
var ClientGameItem = require('../gameItem/ClientGameItem');
var PlayerMixin = require('./PlayerMixin');

function ClientPlayer(entityID,physics,mesh) {

  ClientGameItem.apply(this,[
    entityID,
    physics,
    mesh
  ]);

}

ClientGameItem.subclass(ClientPlayer);
PlayerMixin.mixin(ClientPlayer);

module.exports = ClientPlayer;
