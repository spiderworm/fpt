
import Vector from './Vector';

let Position = Vector.createClass({x: 0, y: 0, z: 0});

Position.shim = function(targetObject, hiddenVector) {
	Vector.shim(targetObject, 'position', new Position(), hiddenVector);
}

export default Position;
