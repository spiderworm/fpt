
var engine = {};

var libs = require('./lib/sharedLibs');
for(var name in libs) {
  engine[name] =  libs[name];
}

var clientEngine = require('./clientEngine');
for(var name in clientEngine) {
  engine[name] = clientEngine[name];
}

var serverEngine = require('./serverEngine');
for(var name in serverEngine) {
  engine[name] = serverEngine[name];
}

module.exports = Engine;