
export default class SystemCollection {
	
	static create() {
		return new SystemCollection();
	}

	constructor() {
		this._systems = [];
	}

	add(system) {
		this._systems.push(system);
	}

	forEach(callback) {
		this._systems.forEach(callback);
	}

}
