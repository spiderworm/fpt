var engine = require('./serverEngine');
//var map = require('./maps/boxMapGenerator');
var map = require('./maps/boxMap');
var Grenade = require('./gameItems/grenade/ServerGrenade');

function FPTServer() {
  var server = new engine.InstantServer();
  server.game.setMap(map);
  server.game.registerItemType('Grenade',Grenade);
  server.game.subscribeToItems(engine.Server.Player,function(player) {
    var grenade = new Grenade();
    player.wieldItem(grenade);
  });

  return server;
}

module.exports = FPTServer;