
import Entity from '../ecs/Entity';
import voxel from 'voxel';
import TerrainPhysics from './TerrainPhysics';
import PiecesComponent from '../PiecesComponent';

let Terrain = Entity.createClass({

	constructor: function(options) {

		this.set(
			'voxels',
			voxel({
				generateVoxelChunk: function(low, high) {
					return voxel.generate(low, high, options.solver);
				}.bind(this),
				cubeSize: 1
			})
		);

		this.set(
			'pieces',
			PiecesComponent.create()
		);

	},

	generateRange: function(low, high) {
		let voxels = this.get('voxels');
		let chunkLow = voxels.chunkAtCoordinates(low.x, low.y, low.z);
		let chunkHigh = voxels.chunkAtCoordinates(high.x, high.y, high.z);
		this.generateChunkBlock(
			{
				x: chunkLow[0],
				y: chunkLow[1],
				z: chunkLow[2]
			},
			{
				x: chunkHigh[0],
				y: chunkHigh[1],
				z: chunkHigh[2]
			}
		);

	},

	generateChunkBlock: function(low, high) {
		let voxels = this.get('voxels');
		for (let x = low.x; x <= high.x; x++) {
			for (let y = low.y; y <= high.y; y++) {
				for (let z = low.z; z <= high.z; z++) {
					voxels.generateChunk(x, y, z);
				}
			}
		}
		this.set(
			'terrain-physics',
			TerrainPhysics.create(this)
		);
	},

	getBlockAt: function(pos) {
		pos = this._parseVectorArguments(arguments);
		return this.get('voxels').voxelAtPosition(pos);
	},

	export: function() {
		let voxels = this.get('voxels');
		let result = {
			chunkSize: voxels.chunkSize,
			chunks: JSON.parse(JSON.stringify(voxels.chunks))
		};
		// discard empty chunks
		for (let chunkId in result.chunks) {
			let remove = true;
			for (let voxelId in result.chunks[chunkId].voxels) {
				if (result.chunks[chunkId].voxels[voxelId]) {
					remove = false;
					break;
				}
			}
			if (remove) {
				delete result.chunks[chunkId];
			}
		}

		return result;
	},

	import: function(exported) {
		let voxels = this.get('voxels');
		voxels.chunkSize = exported.chunkSize;
		voxels.chunks = exported.chunks;
		this.set(
			'terrain-physics',
			TerrainPhysics.create(this)
		);
	},

	_parseVectorArguments: function(args) {
		if (!args) return false;
		if (args[0] instanceof Array) return args[0];
		return [args[0], args[1], args[2]];
	}
});

Terrain.create = function(opts) {
	return new Terrain(opts);
};

export default Terrain;