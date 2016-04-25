
import Vector from './Vector';

let RotationEuler = Vector.createClass({x: 0, y: 0, z: 0});

RotationEuler.shim = function(targetObject, hiddenVector) {
	Vector.shim(targetObject, 'rotationEuler', new RotationEuler(), hiddenVector);
}

RotationEuler.fromVector4 = function(vector4) {
	var order = "YZX";

	var heading, attitude, bank;
	var x = vector4.x, y = vector4.y, z = vector4.z, w = vector4.w;
	var euler = new RotationEuler();

	switch(order){
		case "YZX":
			var test = x*y + z*w;
			if (test > 0.499) { // singularity at north pole
				heading = 2 * Math.atan2(x,w);
				attitude = Math.PI/2;
				bank = 0;
			}
			if (test < -0.499) { // singularity at south pole
				heading = -2 * Math.atan2(x,w);
				attitude = - Math.PI/2;
				bank = 0;
			}
			if(isNaN(heading)){
				var sqx = x*x;
				var sqy = y*y;
				var sqz = z*z;
				heading = Math.atan2(2*y*w - 2*x*z , 1 - 2*sqy - 2*sqz); // Heading
				attitude = Math.asin(2*test); // attitude
				bank = Math.atan2(2*x*w - 2*y*z , 1 - 2*sqx - 2*sqz); // bank
			}
		break;
		default:
			throw new Error("Euler order " + order + " not supported yet."); break;
	}

	euler.set({
		x: bank,
		y: heading,
		z: attitude
	});

	return euler;
}

export default RotationEuler;
