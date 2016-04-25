
export default class EntityCollection {
	
	static create() {
		return new EntityCollection();
	}

	constructor() {
		this._hash = {};
		this._entities = [];
	}

	add(name, entity) {
		if (typeof name === 'string') {
			this._hash[name] = entity;
		} else {
			entity = name;
		}
		this._entities.push(entity);
	}

	get(name) {
		return this._hash[name];
	}

	forEach(callback) {
		this._entities.forEach(callback);
	}

}
