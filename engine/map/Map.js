var voxel = require('voxel');
var crunch = require('voxel-crunch');
var _ = require('underscore');

function Map() {
  this.settings = {
    initialPosition: [0, 0, 0],
    generate: voxel.generator['Plains'],
    chunkDistance: 3,
    removeDistance: 6,
    chunkSize: 32,
    generateChunks: true
  };
  this.chunks = null;
}

Map.fromExported = function(exported) {
  var map = new Map();
  map.settings = _.clone(exported.settings);
  map.settings.generate = function(x,y,z) { console.info('generate'); return 0; };
  if(exported.chunks) {
    map.chunks = _.clone(exported.chunks);
    for(var id in map.chunks) {
      map.chunks[id].voxels = crunch.decode(map.chunks[id].voxels,map.chunks[id].length);
    }
  }
  return map;
}

Map.exportMap = function(server) {
  var result = {
    settings: _.clone(server._map.settings),
    chunks: _.clone(server.game.voxels.chunks),
    isExportedMap: true
  };

  result.settings.generateChunks = false;
  delete result.settings.generate;

  for(var id in result.chunks) {
    if(chunkEmpty(result.chunks[id])) {
      delete result.chunks[id];
    } else {
      result.chunks[id].voxels = crunch.encode(result.chunks[id].voxels);
    }
  }

  return result;
}

function chunkEmpty(chunk) {
  for(var i=chunk.voxels.length-1; i>=0; i--) {
    if(chunk.voxels[i] !== 0) {
      return false;
    }
  }
  return true;
}

module.exports = Map;
