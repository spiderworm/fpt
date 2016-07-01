
import Demo from './Demo';
import THREE from 'three';
import DemoLevel1 from './DemoLevel1';
import TestBall from '../../game/testBall/TestBall';

var demo = Demo.create({
	level: new DemoLevel1()
});

setInterval(() => {

	const ball = new TestBall({
		position: {x: 0, y: 15, z: 0},
		rotation: {w: 1, x: 0, y: 0, z: 0},
	});
	demo.game.entities.add(ball);

}, 1000);



/*
let ball = new THREE.Mesh(
	new THREE.SphereGeometry(5),
	new THREE.MeshLambertMaterial({
		color: 'red'
	})
);
ball.position.set(-20, 30, 0);
ball.castShadow = true;
*/

//window.ball = ball;
//demo.view.scene.add(ball);
