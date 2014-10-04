var Server = require('./Server');
var InstantPlayer = require('./player/InstantServerPlayer');
var InstantControls = require('./controls/InstantServerControls');
var InstantConnection = require('./connection/InstantServerConnection');
var InstantUser = require('./user/InstantServerUser');
var events = require('./events');

function InstantServer() {

  Server.apply(this);

  this.game.registerItemType('Player',InstantPlayer);

  var server = this;

  var WebSocketServer = require('ws').Server;
  var websocket = require('websocket-stream')
  var wss = new WebSocketServer({port: 8081});

  wss.on('connection', function(ws) {
    var stream = websocket(ws);

    var connection = new InstantConnection(stream);

    var player = new InstantPlayer(connection,server.game._map.settings.initialPosition);
    var buttons = {
      forward: false,
      left: false,
      backward: false,
      right: false,
      fire: false,
      firealt: false,
      jump: false,
      crouch: false,
      alt: false
    };
    var controls = new InstantControls(connection,buttons,{});
    controls.setTarget(player);
    player.addItem(controls);
    server.game.addItem(player);

    var user = server.__users[connection.id] = new InstantUser(
      connection,
      server.game._engine,
      server._physics,
      player
    );

    server.emit(InstantServer.NEW_USER,user);

    connection.on('exportMap',function() {
      connection.emit('mapExported',Map.exportMap(server));
    });

    connection.emit('entity.id', connection.id);
    connection.emit('game.settings', server.game.settings);
    
    connection.emit(
      events.STARTING_ITEMS,
      server.game.serialize()
    );

  });

  setInterval(function() {
    console.info('ping');
  },1000);

  this.on(InstantServer.NEW_USER,function(user) {
  });

}

Server.subclass(InstantServer);

InstantServer.NEW_USER = 'new-user';

module.exports = InstantServer;
