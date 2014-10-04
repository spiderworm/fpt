var engine = require('./clientEngine');
var Brick = require('./blocks/Brick');
var Grenade = require('./gameItems/grenade/ClientGrenade');

function FPTClient() {
  engine.InstantClient.apply(this);
  this.game.registerBlock(Brick);
  this.game.set('texturePath',"mods/fpt/textures/");
  this.game.registerItemType('Grenade',Grenade);
}

engine.InstantClient.subclass(FPTClient);

module.exports = FPTClient;