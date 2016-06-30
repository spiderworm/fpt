
import Demo from './Demo';
import THREE from 'three';
import DemoLevel1 from './DemoLevel1';

var demo = Demo.create({
	level: new DemoLevel1()
});

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
