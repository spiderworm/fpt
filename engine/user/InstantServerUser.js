var chunkEncoder = require('../util/chunkEncoder');
var chunkUtil = require('../util/chunkUtil');
var InstantPlayer = require('../player/InstantServerPlayer');

function InstantUser(connection,game,gamePhysics,player) {
  this.id = connection.id;
  this.connection = connection;
  this._game = game;
  this._chunkSyncer = new ChunkSyncer(connection);

  this.player = player;

  var user = this;

  connection.on('missingChunk', function(input) {
    var chunk = chunkUtil.getChunk(game.voxels,input);
    if(!chunk && game.generateChunks) {
      chunk = game.voxels.generateChunk(input[0],input[1],input[2]);
    }
    if(chunk) {
      user.sendChunk(chunk);
    }
  });

  connection.emit('initial-position',this.player.position);

  this._sendInitialChunks();
}

InstantUser.prototype.sendChunk = function(chunk) {
  this.sendChunks([chunk]);
}

InstantUser.prototype.sendChunks = function(chunks) {
  var nearbyChunkIDs = this._game.voxels.nearbyChunks(
    this.player.position,
    this._game.removeDistance
  ).map(function(chunkPos) {
    return chunkUtil.getID(chunkPos);
  });

  for(var i=0; i<chunks.length; i++) {
    var chunk = chunkUtil.getChunk(this._game.voxels,chunks[i]);
    if(chunk) {
      var position = chunk.position;
      var id = chunkUtil.getID(chunk);
      if(nearbyChunkIDs.indexOf(id) !== -1) {
        this._chunkSyncer.send(chunk);
      }
    }
  }
}

InstantUser.prototype._sendInitialChunks = function(connection) {
  var client = this;

  var chunkPositions = this._game.voxels.nearbyChunks(
    this.player.position,
    this._game.chunkDistance
  );

  this.sendChunks(chunkPositions);

  setTimeout(function() {

    client.connection.emit('noMoreChunks', true);

  }, 10000);
}





function ChunkSyncer(connection) {
  this._connection = connection;
  this._outbox = [];
  var chunkSyncer = this;
  setInterval(function() {
    chunkSyncer._sendNext();
  },200);
}

ChunkSyncer.prototype.send = function(chunk) {
  this._outbox.push(chunk);
}

ChunkSyncer.prototype._sendNext = function() {
  var voxels = 0;
  while(this._outbox.length > 0 && voxels < 16000) {
    var chunk = this._outbox.shift();
    voxels += chunk.voxels.length;
    var encoded = chunkEncoder.encode(chunk);
    this._connection.emit('chunk', encoded, {
      position: chunk.position,
      dims: chunk.dims,
      length: chunk.voxels.length
    });
  }
}

module.exports = InstantUser;