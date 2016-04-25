
import Vector from './Vector';

let Velocity = Vector.createClass({x: 0, y: 0, z: 0});

Velocity.shim = function(targetObject, hiddenVector) {
	Vector.shim(targetObject, 'velocity', new Velocity(), hiddenVector);
}

export default Velocity;
