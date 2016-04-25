
import THREE from 'three';
import CANNON from 'cannon';

export default class ConstraintDebugView {
	
	constructor(cannonConstraint) {
		this.cannon = cannonConstraint;
		this.three = new THREE.Object3D();
		this.threeBodyA = new THREE.Mesh(
			new THREE.SphereGeometry(.2, 4, 4),
			new THREE.MeshBasicMaterial({
				wireframe: true,
				color: 0xff0000
			})
		);
		this.threeBodyB = this.threeBodyA.clone();
		this.three.add(this.threeBodyA);
		this.three.add(this.threeBodyB);
	}

	tick() {
		var pivotA = this.cannon.pivotA || new CANNON.Vec3();
		var pivotB = this.cannon.pivotB || new CANNON.Vec3();
		var vectorA = this.cannon.bodyA.pointToWorldFrame(pivotA);
		var vectorB = this.cannon.bodyB.pointToWorldFrame(pivotB);

		this.threeBodyA.position.set(vectorA.x, vectorA.y, vectorA.z);
		this.threeBodyB.position.set(vectorB.x, vectorB.y, vectorB.z);
	}

};
