
import EventObject from '../shared/EventObject';
import ServerSession from './ServerSession';

class ServerSessionManager {

	static create(socketServer) {
		return new ServerSessionManager(socketServer);
	}

	constructor(socketServer) {
		this._eo = EventObject.create();

		this._nextId = 0;

		this._sessions = {};

		socketServer.on('connection', function(connection) {

			connection.on('message', function(raw) {

				let message = JSON.parse(raw);
				let session;

				if (message.type === ServerSession.GET_SESSION) {
					session = this._createSession(connection);
					connection.send(JSON.stringify({
						type: ServerSession.SET_SESSION,
						data: {
							id: session.id,
							token: session.token
						}
					}));
					console.log('session created:', session.id);
				} else if (message.type === ServerSession.SET_SESSION) {
					if (session = this._updateSession(message.data.id, message.data.token, connection)) {
						console.log('session reestablished:', session.id);
					} else {
						console.log('session rejected:', message.data.id);
						connection.send(JSON.stringify({
							type: ServerSession.SESSION_REFUSED
						}));
					}
				}

			}.bind(this));

		}.bind(this));
	}

	onSession(callback) {
		return this._eo.on('new-session',callback);
	}

	_createSession(connection) {
		let id = this._nextId;
		this._nextId++;
		let token = 'temp-token';
		let session = ServerSession.create();
		session.id = id;
		session.token = token;
		session.connection = connection;
		this._sessions[id] = session;
		return session;
	}

	_updateSession(id, token, connection) {
		let session = this._sessions[id];
		if (session && session.token === token) {
			session.connection = connection;
			return session;
		}
		return null;
	}
	
}

export default ServerSessionManager;
