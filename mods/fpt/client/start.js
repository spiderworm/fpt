
import FPTClient from './FPTClient';
import THREE from 'three';
import CANNON from 'cannon';
import OrbitControls from './THREE.OrbitControls';
import TestBall from '../game/testBall/TestBall';
import PhysicsDebugView from './view/PhysicsDebugView';

var client = FPTClient.create();

document.body.appendChild(client.view.element);



// debugging stuff

console.debug('dummybuild', 1);

window.THREE = THREE;
window.CANNON = CANNON;
window.client = client;

let orbitControls = new OrbitControls(client.view.camera);
setInterval(orbitControls.update.bind(orbitControls), 40);


let lamp = new THREE.HemisphereLight(0xffffff, .5);
lamp.position.set(0, 10, 0);
client.view.scene.add(lamp);

let ball = TestBall.create(
	{
		position: {x: .7, y: 200, z: 0}
	}
);
ball.debug = true;
client.game.entities.add(ball);
window.ball = ball;

let physicsDebugView = PhysicsDebugView.create(client.view);
client.view.systems.add(physicsDebugView);

