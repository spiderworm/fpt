
import Vector from './Vector';

let Rotation = Vector.createClass({w: 1, x: 0, y: 0, z: 0});

Rotation.prototype.normalize = function() {
	var length = Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
	if (length === 0) {
		this.w = this.x = this.y = this.z = 0;
	} else {
		length = 1/length;
		this.w *= length;
		this.x *= length;
		this.y *= length;
		this.z *= length;
	}
};

Rotation.prototype.rotate = function(vector4) {
	var a = this;
	var b = vector4;
	this.set({
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,  // 1
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,  // i
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,  // j
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w   // k
	});
	this.normalize();
};

Rotation.prototype.setFromEuler = function(euler) {

	var bank = euler.x;
	var heading = euler.y;
	var attitude = euler.z;

	var c1 = Math.cos(heading / 2);
	var c2 = Math.cos(attitude / 2)
	var c3 = Math.cos(bank / 2)
	var s1 = Math.sin(heading / 2)
	var s2 = Math.sin(attitude / 2)
	var s3 = Math.sin(bank / 2)

	this.set({
		w: c1 * c2 * c3 - s1 * s2 * s3,
		x: s1 * s2 * c3 + c1 * c2 * s3,
		y: s1 * c2 * c3 + c1 * s2 * s3,
		z: c1 * s2 * c3 - s1 * c2 * s3
	});
};

Rotation.shim = function(targetObject, hiddenVector) {
	Vector.shim(targetObject, 'rotation', new Rotation(), hiddenVector);
};

Rotation.createFromAxisAngle = function(vector3, radians) {
	var factor = Math.sin(radians/2);
	var rotation = new Rotation();
	rotation.set({
		x: vector3.x * factor,
		y: vector3.y * factor,
		z: vector3.z * factor,
		w: Math.cos(radians/2)
	});
	rotation.normalize();
	return rotation;
};

export default Rotation;
