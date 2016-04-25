
import EventObject from '../shared/EventObject';

class ClientConnection {

	static create() {
		return new ClientConnection();
	}

	constructor() {
		this._eo = EventObject.create();
		this._queue = [];
		this.connected = false;
		this._ws = new WebSocket('ws://localhost:3001/');

		this._ws.onopen = function() {
			this.connected = true;
			this._sendNext();
		}.bind(this);

		this._ws.onmessage = function(raw) {
			let msg = JSON.parse(raw.data);
			this._handleMessage(msg);
		}.bind(this);
	}

	send(type, data) {
		this._queue.push({
			type: type,
			data: data
		});
		this._sendNext();
	}

	onMessage(type, callback) {
		return this._eo.on('message:' + type, callback);
	}

	_sendNext() {
		if (!this.connected) {
			return;
		}
		let msg = this._queue.shift();
		if (!msg) {
			return;
		}
		this._ws.send(JSON.stringify(msg));
		this._sendNext();
	}

	_handleMessage(msg) {
		this._eo.triggerEvent('message:' + msg.type, msg.data);
	}

}

export default ClientConnection;
