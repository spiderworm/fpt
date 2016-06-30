
import FPTGame from '../../game/FPTGame';
import FPTGameView from '../view/FPTGameView';
import DemoLevel1 from './DemoLevel1';
import THREE from 'three';
import OrbitControls from '../THREE.OrbitControls';

class Demo {
	
	constructor(game, view) {
		this.game = game;
		this.view = view;

		document.body.appendChild(this.view.element);

		this.installGlobals();
	}

	installGlobals() {
		window.demo = this;
		window.THREE = THREE;

		let light = new THREE.DirectionalLight(0xdfebff, 1.75);
		light.position.set(300, 400, 50);
		light.position.multiplyScalar(1.3);

		light.castShadow = true;
		light.shadowCameraVisible = true;

		let lightTarget = new THREE.Object3D();
		lightTarget.position.set(-10, 10, 0);
		demo.view.scene.add(lightTarget);

		light.target = lightTarget;
		demo.view.scene.add(light);

		window.light = light;

		demo.view.camera.position.set(100, 10, 0);

		let orbitControls = new OrbitControls(demo.view.camera);
		setInterval(orbitControls.update.bind(orbitControls), 40);

		window.camera = demo.view.camera;

	}

};

Demo.create = function(options) {
	options = options || {};
	const game = options.game || new FPTGame();
	game.setLevel(options.level || new DemoLevel1());
	const view = options.view || new FPTGameView(game);
	game.start();
	return new Demo(game, view);
};

export default Demo;
