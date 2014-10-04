
var EventEmitter = require('events').EventEmitter;
var DuplexEmitter = require('duplex-emitter');
var crunch = require('voxel-crunch');
var WebSocket = require('websocket-stream');
var Highlight = require('voxel-highlight');
var Class = require('./lib/Class');
var ClientGame = require('./game/ClientGame');
var InstantControls = require('./controls/InstantClientControls');
var InstantCamera = require('./camera/InstantClientCamera');
var Buttons = require('./controls/Buttons');


function Client() {

  EventEmitter.apply(this);

  this._entityID = null;

  var game = this.game = new ClientGame();

  var connection = this.connection = DuplexEmitter(
    new WebSocket('ws://localhost:8081/')
  );

  this._chunkSyncer = new ChunkSyncer(game,connection);

  this.highlighter = null;

  var buttons = this._buttons = new Buttons(
    document.body,
    {
      '<left>': 'left',
      '<right>': 'right',
      '<up>': 'forward',
      '<down>': 'backward',
      'W': 'forward',
      'A': 'left',
      'S': 'backward',
      'D': 'right',
      '<mouse 1>': 'fire',
      '<space>': 'jump'
    }
  );

  var controls = this._controls = new InstantControls(connection,buttons);
  controls.id = "controls";
  this.game.addItem(controls);

  var self = client = this;

  this.game.on('new-item',function(item) {
    if(client._controlID && item.id && client._controlID === item.id) {
      client._control(item);
    }
  });

  connection.on('entity.id', function(id) {
    client._controlID = id;
    var item = client.game.getItemByID(id);
    if(item) {
      client._control(item);
    }
  });
  
  connection.on('initial-position', function(position) {
    game.initialPosition = position;
  });

  // after all chunks loaded
  connection.on('noMoreChunks', function() {

    // if not capable, throw error
    if (game._engine.notCapable()) {
      try{ throw 'engine not capable' }
      catch(err) { self.emit('error',err) }
    }

    game._engine.interact.on('attain', function(inputRotationStream) {
      controls.setMouseRotationStream(inputRotationStream);
    });

    // tell modules consumers we're ready
    self.emit('loadComplete');
  });

  // fires when server sends us voxel edits
  connection.on('set', function(pos, val) {
    game._engine.setBlock(pos, val)
  });

  connection.on("mapExported",function(exported) {
    var win = window.open("about:blank");
    win.document.write("module.exports = " + JSON.stringify(exported) + ";");
  });

  this.connection.on('game.settings', function(settings) {

    game.start(settings);
    
    var camera = client._camera = new InstantCamera(client.game._engine.camera);
    client.game.addItem(camera);

    client.highlighter = new Highlight(game._engine);

    game._engine.voxels.on('missingChunk', function(position){
      client._chunkSyncer.request(position);
    });

    connection.on('leave', function removeClient(id) {
      if (!client.remoteClients[id]) return;
      game._engine.scene.remove(client.remoteClients[id].mesh)
      delete client.remoteClients[id];
    });

  });

  connection.on('items.update',function(update) {
    game.applyUpdate(update);
  });

}

Class.subclass(EventEmitter,Client);

Object.defineProperty(
  Client.prototype,
  "element",
  {
    get: function() {
      return this.game._engine.view.element;
    }
  }
);

Client.prototype.exportMap = function() {
  this.connection.emit('exportMap');
}

Client.prototype._control = function(gameItem) {
  this._controls.setTarget(gameItem);
  this._camera.possess(gameItem);
}




function ChunkSyncer(game,connection) {
  this._game = game;
  this._connection = connection;
  this._outbox = [];
  this._requested = [];

  var chunkSyncer = this;

  connection.on('chunk', function(encoded, chunk) {
    console.info('chunk');
    chunkSyncer._received(encoded,chunk);
  });
}

ChunkSyncer.prototype.request = function(chunkPosition) {
  if(
    this._searchOutbox(chunkPosition) === -1 &&
    this._searchRequested(chunkPosition) === -1
  ) {
    this._outbox.push(chunkPosition);
    this._requestNext();
  }
}

ChunkSyncer.prototype._received = function(encoded,chunk) {
  if (encoded.length === undefined) {
    var lastIndex = Math.max.apply(null,Object.keys(encoded).map(Number));
    encoded.length = lastIndex+1;
  }
  var voxels = crunch.decode(encoded, chunk.length);
  chunk.voxels = voxels;
  this._game.addChunk(chunk);

  var chunkPosition = chunk.position;

  var i = this._searchOutbox(chunkPosition);
  if(i !== -1) {
    this._outbox.splice(i,1);
  }
  i = this._searchRequested(chunkPosition);
  if(i !== -1) {
    this._requested.splice(i,1);
  }
  this._requestNext();
}

ChunkSyncer.prototype._requestNext = function() {
  while(this._outbox.length > 0) {
    var position = this._outbox.shift();
    this._requested.push(position);
    this._connection.emit('missingChunk',position);
  }
}

ChunkSyncer.prototype._searchOutbox = function(chunkPosition) {
  for(var i=this._outbox.length-1; i>=0; i--) {
    if(this._positionsMatch(chunkPosition,this._outbox[i])) {
      return i;
    }
  }
  return -1;
}

ChunkSyncer.prototype._searchRequested = function(chunkPosition) {
  for(var i=this._requested.length-1; i>=0; i--) {
    if(this._positionsMatch(chunkPosition,this._requested[i])) {
      return i;
    }
  }
  return -1;
}

ChunkSyncer.prototype._positionsMatch = function(position1,position2) {
  return position1 === position2 || (
    position1[0] === position2[0] &&
    position1[1] === position2[1] &&
    position1[2] === position2[2]
  );
}



module.exports = Client;
