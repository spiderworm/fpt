
import THREE from 'three';
import TerrainView from './TerrainView';
import System from '../../game/ecs/System';
import MeshComponent from './MeshComponent';

let FPTGameView = System.createClass({

	constructor: function(fptGame) {
		this.game = fptGame;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			75, window.innerWidth / window.innerHeight, 0.1, 1000
		);
		this.camera.position.setZ(10);
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
	    this.renderer.shadowMapEnabled = true;
	    this.renderer.shadowMapSoft = true;
		this.renderer.setClearColorHex( 0xffffff );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.element = this.renderer.domElement;

		this.terrain = TerrainView.create(fptGame.level.terrain);
		this.scene.add(this.terrain.three);

		let tick = function() {
			this.tick();
			requestAnimationFrame(tick);
		}.bind(this);

		requestAnimationFrame(tick);

	},

	tick() {
		this.tickSubsystems();
		this.game.entities.forEach(this.tickEntity.bind(this));
		this.renderer.render(this.scene, this.camera);
	},

	tickEntity(entity) {
		var view = entity.get('view');
		var physics = entity.get('physics');
		let mesh = entity.get('mesh');
		if (view && physics) {
			if (!mesh) {
				mesh = MeshComponent.create();
				this.scene.add(mesh.three);
				entity.set('mesh', mesh);
			}
			var position = physics.position;
			var rotation = physics.rotation;
			mesh.three.position.set(position.x, position.y, position.z);
			mesh.three.useQuaternion = true;
			mesh.three.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
		}
		let pieces = entity.get('pieces');
		if (pieces) {
			pieces.forEach(this.tickEntity.bind(this));
		}
	},

	exportLevel() {
		let w = window.open("","");
		w.document.write(JSON.stringify(this.game.level.export()));
		w.document.close();
	}

});

FPTGameView.create = function(fptGame) {
	return new FPTGameView(fptGame);
};

export default FPTGameView;
