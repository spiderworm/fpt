
var Game = require('./Game');
var extend = require('extend');
var Engine = require('voxel-engine');
var ClientGameItem = require('../gameItem/ClientGameItem');
var libs = require('../lib/sharedLibs');

function ClientGame() {

  Engine.prototype.hookupControls = 
  Engine.prototype.makePhysical = 
  Engine.prototype.onControlChange = function() {};

  ClientGameItem.apply(this);
  Game.apply(this);

  var clientGame = this;

  function tick() {
    requestAnimationFrame(tick);
    clientGame.tick();
  }

  tick();
}

ClientGameItem.subclass(ClientGame);
Game.mixin(ClientGame);

ClientGame.prototype.start = function(settings) {
  if(!settings) {
    settings = {};
  }
  if(this._engine) {
    this.stop();
  }

  extend(settings,{
    isClient: true,
    generateChunks: false,
    controlsDisabled: false,
    texturePath: this.texturePath,
    keybindings: this.keybindings,
    playerTexture: this.playerTexture

  });
  
  this._engine = new Engine(settings);
  this.view = this._engine.scene;
  libs.THREE = this._engine.THREE;
  this.settings = settings;
}

module.exports = ClientGame;
