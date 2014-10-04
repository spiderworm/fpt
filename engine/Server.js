
var Class = require('./lib/Class');
var EventEmitter = require('events').EventEmitter;
var ServerGame = require('./game/ServerGame');

function Server() {
  EventEmitter.apply(this);

  this.game = new ServerGame();

  this.__users = {};

  var server = this;
  setInterval(function() {
    server.sendUpdate()
  }, 100);

}

Class.subclass(EventEmitter,Server);

Server.prototype.broadcast = function(id, event) {
  var self = this;
  var args = [].slice.apply(arguments);
  args.shift();
  if (id !== 'server') self.emit.apply(self,args);
  Object.keys(self.__users).map(function(userID) {
    if (userID === id) return;
    var connection = self.__users[userID].connection;
    connection.emit.apply(connection,args);
  });
}

Server.prototype.sendUpdate = function() {
  var update = this.game.getUpdate();
  this.broadcast(null,'items.update',update);
}

Server.prototype.handleErrors = function(func) {
  var self = this
  return function() {
    try {
      return func.apply(this,arguments)
    } catch (error) {
      self.emit('error',error)
    }
  }
}

Server.STARTING_ITEMS = 'starting-items';

module.exports = Server;
