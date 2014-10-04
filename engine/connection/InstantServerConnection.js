var duplexEmitter = require('duplex-emitter');
var extend = require('extend');
var uuid = require('hat');

function Connection(duplexStream) {
  var connection = duplexEmitter(duplexStream);
  var id = uuid();
  connection.id = duplexStream.id = id;
  return connection;
}

module.exports = Connection;