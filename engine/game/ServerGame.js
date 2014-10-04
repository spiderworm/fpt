
var libs = require('../lib/sharedLibs');
var Game = require('./Game');
var Map = require('../map/Map');
var extend = require('extend');
var RealPhysics = require('../physics/cannon/Physics');
var Engine = require('voxel-engine');
var ServerGameItem = require('../gameItem/ServerGameItem');

function ServerGame() {

  Engine.prototype.initializeControls = function initializeControls() {}

  Engine.prototype.hookupControls = function hookupControls() {}

  Engine.prototype.control = function control() {
    throw new Error('Don\'t do this');
  }

  Engine.prototype.makePhysical = function makePhysical(mesh, options) {
    throw new Error('Don\'t do this');
  }

  ServerGameItem.apply(this);
  Game.apply(this);

  this.__timestamp = +new Date();

  var serverGame = this;
  setInterval(function() {
    serverGame.tick();
  },100);
}

ServerGameItem.subclass(ServerGame);
Game.mixin(ServerGame);

ServerGame.prototype.tick = function() {
  var stamp = +new Date();
  var dt = stamp - this.__timestamp;
  this.__timestamp = stamp;
  ServerGameItem.prototype.tick.apply(this,[dt/1000]);
}

ServerGame.prototype.addItem = function(gameItem) {
  console.info('adding',gameItem.constructor.name);
  ServerGameItem.prototype.addItem.apply(this,[gameItem]);
}

ServerGame.prototype.setMap = function(map) {

  if(map.isExportedMap) {
    map = Map.fromExported(map);
  }

  this._map = map;

  this.start(map.settings);
  var engine = this._engine;
  if(map.chunks) {
    for(var id in map.chunks) {
      engine.voxels.chunks[id] = map.chunks[id];
    }
  }
  engine.gravity = [0, -.5, 0];
  this.physics = new RealPhysics(engine);
  this.__setPhysicsWorld(this.physics);

  if(this.settings.generateChunks && this.settings.bounds) {
    this.generateRegion(
      this.settings.bounds[0],
      this.settings.bounds[1]
    );
  }

}

ServerGame.prototype.generateRegion = function(lowVoxelPos,highVoxelPos) {
  var lowChunkPos = this._engine.voxels.chunkAtPosition(lowVoxelPos);
  var highChunkPos = this._engine.voxels.chunkAtPosition(highVoxelPos);
  for(var x=lowChunkPos[0]; x<=highChunkPos[0]; x++) {
    for(var y=lowChunkPos[1]; y<=highChunkPos[1]; y++) {
      for(var z=lowChunkPos[2]; z<=highChunkPos[2]; z++) {
        if(!this._engine.voxels.chunks[x + "|" + y + "|" + z]) {
          var chunk = this._engine.voxels.generateChunk(x,y,z);
          this._engine.showChunk(chunk);
        }
      }
    }
  }
}

ServerGame.prototype.start = function(settings) {
  if(!settings) {
    settings = {};
  }
  if(this._engine) {
    this.stop();
  }
  settings = extend(
    {
      isClient: false,
      chunkDistance: 2,
      removeDistance: 6,
      chunkSize: 32,
      generateChunks: true,
      materials: [
        ['grass', 'dirt', 'grass_dirt'],
        'obsidian',
        'brick',
        'grass'
      ],
      worldOrigin: [0, 0, 0],
      controls: { discreteFire: true }
    },
    settings
  );
  this._engine = new Engine(settings);
  libs.THREE = this._engine.THREE;
  this.settings = settings;
}




module.exports = ServerGame;
