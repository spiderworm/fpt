
export default class Ticker {

	static create(ms, callback) {
		return new Ticker(ms, callback);
	}

	constructor(ms, callback) {
		this._time = +(new Date());
		this._callback = callback;
		setInterval(this._nextTick.bind(this), ms);
	}

	_nextTick() {
		let now = +(new Date());
		let ms = now - this._time;
		this._time = now;
		this._callback(ms);
	}

};
