
class Entity {
	
	static createClass(props) {
		function Klass() {
			Entity.call(this);
			props.constructor.apply(this,arguments);
		};
		Klass.prototype = props;
		props.__proto__ = Entity.prototype;
		return Klass;
	}

	static create() {
		return new Entity();
	}

	constructor() {
		this.components = {};
	}

	set(name, value) {
		this.components[name] = value;
	}

	get(name) {
		return this.components[name];
	}

}

export default Entity;
