
import Vector from './Vector';

let AngularVelocity = Vector.createClass({x: 0, y: 0, z: 0});

AngularVelocity.shim = function(targetObject, hiddenVector) {
	Vector.shim(targetObject, 'angularVelocity', new AngularVelocity(), hiddenVector);
}

export default AngularVelocity;
