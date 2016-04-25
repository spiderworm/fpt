
class EventObject {

	static create() {
		return new EventObject();
	}

	constructor() {
		this._handlers = [];
	}

	on(type, callback) {
		let handler = Handler.create(this, callback);
		this._getHandlers(type).push(handler);
		return handler;
	}

	triggerEvent(type, ...args) {
		let handlers = this._getHandlers(type);
		handlers.forEach(function(handler) {
			handler.trigger(args);
		});
	}

	_getHandlers(type) {
		if (!this._handlers[type]) {
			this._handlers[type] = [];
		}
		return this._handlers[type];
	}

}

class Handler {

	static create(target, callback) {
		return new Handler(target, callback);
	}

	constructor(target, callback) {
		this.target = target;
		this.callback = callback;
	}

	trigger(args) {
		this.callback.apply(this.target, args);
	}

}


export default EventObject;