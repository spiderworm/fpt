
import THREE from 'three';
import LevelBuilder from './LevelBuilder';
import OrbitControls from '../../THREE.OrbitControls';


var demo = LevelBuilder.create();
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

demo.view.camera.position.set(20, 4, 0);
demo.view.camera.lookAt(new THREE.Vector3(0, 0, 0));

/*
let orbitControls = new OrbitControls(demo.view.camera);
setInterval(orbitControls.update.bind(orbitControls), 40);
*/

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
