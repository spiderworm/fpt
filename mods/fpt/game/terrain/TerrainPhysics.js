
import CANNON from 'cannon';
import merge from './terrainPhysics-merge';
import Terrain from './Terrain';
import TerrainPiece from './TerrainPiece';

var X = 0;
var Y = 1;
var Z = 2;

var WIDTH = 0;
var HEIGHT = 1;
var DEPTH = 2;

export default class TerrainPhysics {

	static create(terrain) {
		return new TerrainPhysics(terrain);
	}

	constructor(terrain) {

		this.terrain = terrain;

		let voxels = terrain.get('voxels');

		for (var chunkPos in voxels.chunks) {
			var chunk = voxels.chunks[chunkPos];
			if (chunk) {
				this.createChunkPhysics(chunk);
			}
		}

	}

	createChunkPhysics(chunk) {
		var cache = {};
		var pieces = this.terrain.get('pieces');

		function isProcessed(pos) {
			return cache[pos.join('|')] || false;
		}

		function markProcessed(pos) {
			return cache[pos.join('|')] = true;
		}

		this.createChunkPhysics.items = this.createChunkPhysics.items || {};
		var chunkItems = this.createChunkPhysics.items[chunk.position.join('|')];
		if (chunkItems) {
			chunkItems.forEach(function(item) {
				if(item.mesh) {
					this.scene.remove(item.mesh);
				}
				//this.world.remove(item.body);
			}.bind(this));
		}
		chunkItems = this.createChunkPhysics.items[chunk.position.join('|')] = []

		merge.all(

			function(pos) {
				return this.terrain.getBlockAt(pos) && !isProcessed(pos)
			}.bind(this),

			chunk,

			function(result) {

				merge.voxelsIn(result).forEach(function(pos) {
					markProcessed(pos);
				});
				var position = result.position.map(function(v, i) {return v + result.dims[i] / 2;});

				var boxShape = new CANNON.Box(new CANNON.Vec3(result.dims[WIDTH] / 2, result.dims[HEIGHT] / 2, result.dims[DEPTH] / 2));
				var box = new CANNON.Body({
					mass: 0
				});
				box.addShape(boxShape);
				box.position.set.apply(box.position, position);

				var item = {
					mesh: null,
					body: box
				};

				chunkItems.push(item);

				let piece = TerrainPiece.create({
					cannon: box
				});

				pieces.add(piece);

			}.bind(this)
		);
	}
}
