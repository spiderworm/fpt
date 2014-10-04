
var extend = require('extend');
var GameItem = require('../gameItem/GameItem');
var Engine = require('voxel-engine');
var libs = require('../lib/sharedLibs');

function Game(settings) {

  GameItem.apply(this);

  settings = settings || {};

  this._client = settings.client || false;

  this.keybindings = {
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
  };

  this.texturePath = "/textures/";
  this.playerTexture = 'player.png';

  this.initialPosition = [0,0,0];

  this._blocks = [];
}

GameItem.subclass(Game);

Game.prototype.addChunk = function(chunk) {
  this._engine.showChunk(chunk);
}

Game.prototype.registerBlock = function(Block) {
  this._blocks[Block.id] = Block;
}

Game.prototype.set = function(name,value) {
  if(arguments.length === 1) {
    var values = arguments[0];
    for(var i in values) {
      this.set(i,values[i]);
    }
  } else if(arguments.length === 2) {
    switch(name) {
      case "texturePath":
      case "keybindings":
        this[name] = value;
      break;
    }
  }
}

Game.prototype.start = function(settings) {
  throw new Error('not implemented');
}

Game.prototype.stop = function() {
  throw new Error('not implemented');
}

module.exports = Game;
