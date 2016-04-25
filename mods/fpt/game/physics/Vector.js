
export default class Vector {

	static createClass(vals) {
		function Klass() {
			this.points = Object.keys(vals);
			this.set(vals);
		};
		Klass.prototype.__proto__ = Vector.prototype;
		return Klass;
	}
	
	constructor(vals) {
		this.points = Object.keys(vals);
		this.set(vals);
	}

	set(vals) {
		for (let prop in vals) {
			this[prop] = vals[prop];
		}
	}

	get() {
		var result = {};
		this.points.forEach(function(dim) {
			result[dim] = this[dim];
		}.bind(this));
		return result;
	}

}

Vector.shim = function(targetObject, publicProperty, publicVector, hiddenVector) {

	publicVector.points.forEach(function(prop) {

		delete publicVector[prop];

		Object.defineProperty(publicVector, prop, {
			get: function() {
				return hiddenVector[prop];
			},
			set: function(val) {
				hiddenVector[prop] = val;
			}
		});

	});

	Object.defineProperty(targetObject, publicProperty, {
		get: function() {
			return publicVector;
		},
		set: function(val) {
			publicVector.set(val);
		}
	});

}
