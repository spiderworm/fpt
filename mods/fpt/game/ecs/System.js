
import SystemCollection from './SystemCollection';

class System {
	
	static createClass(props) {
		function Klass() {
			System.call(this);
			props.constructor.apply(this,arguments);
		};
		Klass.prototype = props;
		props.__proto__ = System.prototype;
		return Klass;
	}

	static create() {
		return new System();
	}

	constructor() {
		this.systems = SystemCollection.create();
	}

	tick(ms) {
		if (this.entities) {
			this.entities.forEach(function(entity) {
				this.tickEntity(entity, ms);
			}.bind(this));
		}
		this.tickSubsystems(ms);
	}

	tickEntity(entity, ms) {}

	tickSubsystems(ms) {
		this.systems.forEach(system => system.tick(ms));
	}

}

export default System;
