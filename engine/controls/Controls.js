
var Class = require('../lib/Class');
var Stream = require('stream').Stream;

function Controls(connection) {
  Stream.call(this);
  this._connection = connection;
}

Class.subclass(Stream,Controls);

module.exports = Controls;
