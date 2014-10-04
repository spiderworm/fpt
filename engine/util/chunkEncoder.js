
var crunch = require('voxel-crunch');
var chunkUtil = require('../util/chunkUtil');

function ChunkEncoder() {
  this._cache = {};
}

ChunkEncoder.prototype.encode = function(chunk) {
  var id = chunkUtil.getID(chunk);
  if(!this._cache[id]) {
    this._cache[id] = crunch.encode(chunk.voxels);
  }
  return this._cache[id];
}

ChunkEncoder.prototype.uncache = function(chunk) {
  var id = chunkUtil.getID(chunk);
  delete this._cache[id];
}

var chunkEncoder = new ChunkEncoder();

module.exports = chunkEncoder;