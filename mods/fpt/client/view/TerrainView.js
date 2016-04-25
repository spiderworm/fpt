
import THREE from 'three';
import voxelMesh from 'voxel-mesh';
import Texture from 'voxel-texture';
import voxel from 'voxel';

export default class TerrainView {

	static create(terrain) {
		return new TerrainView(terrain);
	}

	constructor(terrain) {
		this.terrain = terrain;
		this.three = new THREE.Object3D();
		this.materials = new Texture({
			game: {
				THREE: THREE
			},
			texturePath: '/client/textures/',
			materialType:  THREE.MeshLambertMaterial,
			materialParams: {},
			materialFlatColor: false
		});

		this.materialNames = [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt', 'obsidian', 'plank', 'shama', 'whitewool'];
		this.materials.load(this.materialNames);

		this.showAllChunks();
	}

	showChunkAtPosition(pos) {
		let voxels = this.terrain.get('voxels'),
			chunkID = voxels.chunkAtPosition(pos).join('|'),
			chunk = voxels.chunks[chunkID];
		this.showChunk(chunk);
	}

	showAllChunks() {
		let chunks = this.terrain.get('voxels').chunks;
		for (var chunkIndex in chunks) {
			this.showChunk(chunks[chunkIndex]);
		}
	}

	showChunk(chunk) {
		var chunkIndex = chunk.position.join('|');

		let voxels = this.terrain.get('voxels'),
			bounds = voxels.getBounds.apply(this.voxels, chunk.position),
			scale = new THREE.Vector3(1, 1, 1),
			mesher = voxel.meshers.culled,
			mesh = voxelMesh(chunk, mesher, scale, THREE);
		voxels.chunks[chunkIndex] = chunk;
		if (voxels.meshes[chunkIndex]) {
			if (voxels.meshes[chunkIndex].surfaceMesh) {
				this.three.remove(voxels.meshes[chunkIndex].surfaceMesh);
			}
			if (voxels.meshes[chunkIndex].wireMesh) {
				this.three.remove(voxels.meshes[chunkIndex].wireMesh);
			}
		}
		voxels.meshes[chunkIndex] = mesh;

		if (this.meshType === 'wireMesh') {
			mesh.createWireMesh(0x111111);
		} else {
			mesh.createSurfaceMesh(this.materials.material);
			mesh.surfaceMesh.castShadow = mesh.surfaceMesh.receiveShadow = true;
		}

		this.materials.paint(mesh);

		mesh.setPosition(bounds[0][0]*32, bounds[0][1]*32, bounds[0][2]*32);

		mesh.addToScene(this.three);

		return mesh;
	}
};

