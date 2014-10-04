
var engine = {};

var serverLibs = require('./lib/serverLibs');
for(var name in serverLibs) {
  engine[name] = serverLibs[name];
}

engine.Server = require('./Server');
engine.Server.GameItem = require('./gameItem/ServerGameItem');
engine.Server.InstantControls = require('./controls/InstantServerControls');
engine.Server.Player = require('./player/ServerPlayer');
engine.Server.InstantPlayer = require('./player/InstantServerPlayer');
engine.InstantServer = require('./InstantServer');

module.exports = engine;
