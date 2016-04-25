
import FPTGame from '../../game/FPTGame';
import FPTGameView from '../view/FPTGameView';
import DemoLevel1 from './DemoLevel1';
import THREE from 'three';
import OrbitControls from '../THREE.OrbitControls';

class PhysicsDemo {

	constructor() {
		this.game = FPTGame.create();
		this.game.setLevel(DemoLevel1.create());
		this.view = FPTGameView.create(this.game);
	}

	static create() {
		return new PhysicsDemo();
	}

};

var demo = PhysicsDemo.create();
window.demo = demo;

document.body.appendChild(demo.view.element);

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
window.THREE = THREE;

demo.view.camera.position.set(100, 10, 0);

let orbitControls = new OrbitControls(demo.view.camera);
setInterval(orbitControls.update.bind(orbitControls), 40);

let ball = new THREE.Mesh(
	new THREE.SphereGeometry(5),
	new THREE.MeshLambertMaterial({
		color: 'red'
	})
);
ball.position.set(-20, 30, 0);
ball.castShadow = true;

window.ball = ball;
demo.view.scene.add(ball);
