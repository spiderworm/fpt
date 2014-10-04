"use strict"

var libs = require('../../lib/sharedLibs');
var CANNON = libs.CANNON;

var X = 0
var Y = 1
var Z = 2

var WIDTH = 0
var HEIGHT = 1
var DEPTH = 2

module.exports = function(game) {
  var physics = new Physics(game.THREE, {
    gravity: new CANNON.Vec3(game.gravity[0], game.gravity[1], game.gravity[2])
  })

  game.on('tick', function(dt) {
    dt = dt > 300 ? 300 : dt
    physics.tick(dt/200)
  })
  physics.game = game
  game.physics = physics
  game.on('renderChunk', function(chunk) {
    setTimeout(function() {
    physics.createPhysicsEntities(chunk);
    },0);
  })
  for (var chunkPos in game.voxels.chunks) {
    var chunk = game.voxels.chunks[chunkPos]
    if (chunk) physics.createPhysicsEntities(chunk)
  }
  return physics
}

module.exports.control = require('./control')
var merge = require('./merge')

Physics.prototype.createPhysicsEntities = function createPhysicsEntities(chunk) {
  var cache = {}

  function isProcessed(pos) {
    return cache[pos.join('|')] || false
  }
  function markProcessed(pos) {
    return cache[pos.join('|')] = true
  }

  var self = this
  var game = this.game

  createPhysicsEntities.items = createPhysicsEntities.items || {}
  var chunkItems = createPhysicsEntities.items[chunk.position.join('|')]
  chunkItems && chunkItems.forEach(function(item) {
    if(item.mesh) {
      game.scene.remove(item.mesh);
    }
    self.world.remove(item.body);
  })
  chunkItems = createPhysicsEntities.items[chunk.position.join('|')] = []

  merge.all(function(pos) {
    return game.getBlock(pos) && !isProcessed(pos)
  }, chunk, function(result) {
    merge.voxelsIn(result).forEach(function(pos) {
      markProcessed(pos)
    })
    var position = result.position.map(function(v, i) {return v + result.dims[i] / 2})
    var boxShape = new CANNON.Box(new CANNON.Vec3(result.dims[WIDTH] / 2, result.dims[HEIGHT] / 2, result.dims[DEPTH] / 2))
    var box = new CANNON.RigidBody(0, boxShape)
    box.position.set.apply(box.position, position)
    self.world.add(box)

    var item = {
      mesh: null,
      body: box
    };

    chunkItems.push(item);

    if (!self.debug) return

    var mesh = new game.THREE.Mesh(
      new game.THREE.CubeGeometry(result.dims[WIDTH],result.dims[HEIGHT],result.dims[DEPTH]),
      new game.THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
    )

    item.mesh = mesh;
    box.position.copy(mesh.position)
    game.scene.add(mesh)

  });

}

function Physics(THREE, opts) {
  opts = opts || {}
  this.THREE = THREE
  this.CANNON = CANNON
  this.world = createWorld(opts)
  var self = this
  this.items = []
  this.physical = {}
}

function createWorld(opts) {
  opts = opts || {}
  var world = new CANNON.World();
  if (opts.gravity) world.gravity = opts.gravity
    world.broadphase = new CANNON.NaiveBroadphase();
  var solver = new CANNON.GSSolver();
  solver.iterations = 7;
  world.defaultContactMaterial.contactEquationRegularizationTime = 0.55;
  solver.tolerance = 0.01;
  world.solver = solver// new CANNON.SplitSolver(solver);

  world.quatNormalizeFast = true;
  world.quatNormalizeSkip = 0;

  world.defaultContactMaterial.friction = 0.7
  world.defaultContactMaterial.restitution = 0.0
  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRegularizationTime = 4;
  world.broadphase.useBoundingBoxes = true;
  world.allowSleep = false;
  return world
}

Physics.prototype.add = function add(body) {
  var item = {
    mesh: null,
    body: body
  }
  this.items.push(item)
  this.world.add(body)
  return item
}

Physics.prototype.tick = function tick(dt) {
  this.world.step(dt);
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i]
    update(item.mesh, item.body)
  }
}

function update(mesh, body) {
  if(mesh) {
    body.position.copy(mesh.position);
    body.quaternion.copy(mesh.quaternion);
  }
}


