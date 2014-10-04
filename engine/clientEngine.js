
var engine = {};

var libs = require('./lib/clientLibs');
for(var name in libs) {
  engine[name] = libs[name];
}

engine.Client = require('./Client');
engine.Client.GameItem = require('./gameItem/ClientGameItem');
engine.InstantClient = require('./InstantClient');

module.exports = engine;
