
import CANNON from 'cannon';
import Position from './Position';
import Rotation from './Rotation';
import Velocity from './Velocity';

class PhysicsComponent {

	static create(opts) {
		return new PhysicsComponent(opts);
	}

	constructor(options) {
		options = options || {};
		let shape = new CANNON.Box(new CANNON.Vec3(.5, .5, .5));
		let body = new CANNON.Body({
			mass: 1
		});
		body.addShape(shape);
		if (options.position) {
			body.position.set(options.position.x, options.position.y, options.position.z);
		}
		this.cannon = body;
		Position.shim(this, body.position);
		Rotation.shim(this, body.quaternion);
		Velocity.shim(this, body.velocity);
		this.constraints = [];
	}

	get dynamicRotation() {
		return !this.cannon.fixedRotation;
	}

	set dynamicRotation(bool) {
		this.cannon.fixedRotation = !bool;
		this.cannon.updateMassProperties();
	}

}

export default PhysicsComponent;
