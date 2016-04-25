
import THREE from 'three';
import compare from '../../shared/compare';
import clone from '../../shared/clone';

class PhysicsDebugComponent {

	constructor(entity) {
		this.entity = entity;

		let three = new THREE.Object3D();
		let physics = entity.get('physics');

		this.threeAxis = new ThreeAxis();
		three.add(this.threeAxis);

		this.three = three;
	}

	tick() {
		this.tickShapes();
		this.tickPosition();
	}

	tickPosition() {
		let physics = this.entity.get('physics');

		if (physics) {
			let position = physics.position;
			this.three.position.set(position.x, position.y, position.z);

			let rotation = physics.rotation;
			this.three.useQuaternion = true;
			this.three.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
		}
	}

	tickShapes() {
		let physics = this.entity.get('physics');

		if (physics) {

			if (this.oldShapes && compare.arrays(this.oldShapes, physics.cannon.shapes) === true) {
				return;
			}

			if (this.threeShapes) {
				this.three.remove(this.threeShapes);
			}

			this.threeShapes = new THREE.Object3D();
			this.three.add(this.threeShapes);

			let material = new THREE.MeshLambertMaterial({
				color: 0xff0000,
				wireframe: true
			});

			this.oldShapes = clone.array(physics.cannon.shapes);

			physics.cannon.shapes.forEach(function(cannonShape, i) {
				let mesh = new THREE.Mesh(
					new THREE.CubeGeometry(
						cannonShape.halfExtents.x * 2,
						cannonShape.halfExtents.y * 2,
						cannonShape.halfExtents.z * 2
					),
					material
				);
				let position = physics.cannon.shapeOffsets[i];
				mesh.position.set(position.x, position.y, position.z);
				let rotation = physics.cannon.shapeOrientations[i];
				mesh.useQuaternion = true;
				mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
				this.threeShapes.add(mesh);
			}.bind(this));

		}
	}
		
};







function ThreeAxis() {
	return ThreeAxis.prototype.clone();
}

ThreeAxis.prototype = (function() {

	let three = new THREE.Object3D();

	let LENGTH = 2;
	let HALF_LENGTH = LENGTH/2;
	let THICKNESS = .001;

	let xAxis = new THREE.Mesh(
		new THREE.CubeGeometry(LENGTH, THICKNESS, THICKNESS),
		new THREE.MeshBasicMaterial({
			color: 0xff0000,
			wireframe: true
		})
	);
	xAxis.position.setX(HALF_LENGTH);
	xAxis.castShadow = xAxis.receiveShadow = false;
	three.add(xAxis);

	let yAxis = new THREE.Mesh(
		new THREE.CubeGeometry(THICKNESS, LENGTH, THICKNESS),
		new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			wireframe: true
		})
	);
	yAxis.position.setY(HALF_LENGTH);
	yAxis.castShadow = yAxis.receiveShadow = false;
	three.add(yAxis);

	let zAxis = new THREE.Mesh(
		new THREE.CubeGeometry(THICKNESS, THICKNESS, LENGTH),
		new THREE.MeshBasicMaterial({
			color: 0x0000ff,
			wireframe: true
		})
	);
	zAxis.position.setZ(HALF_LENGTH);
	zAxis.castShadow = zAxis.receiveShadow = false;
	three.add(zAxis);

	return three;

})();

export default PhysicsDebugComponent;
