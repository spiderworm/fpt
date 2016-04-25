
import ServerSession from '../server/ServerSession';

export default class ClientSession {
	
	static create(clientConnection) {
		return new ClientSession(clientConnection);
	}

	constructor(clientConnection) {
		this.connection = clientConnection;

		this.authenticated = false;
		this.sessionId = null;
		this.sessionToken = null;

		this.connection.onMessage(
			ServerSession.SET_SESSION,
			function(sessionInfo) {
				this.sessionId = sessionInfo.id;
				this.sessionToken = sessionInfo.token;
				this.authenticated = true;
				localStorage.setItem(ClientSession.STORAGE_KEY, JSON.stringify({
					id: this.sessionId,
					token: this.sessionToken
				}));
				console.log('session established:', this.sessionId);
			}.bind(this)
		);

		this.connection.onMessage(
			ServerSession.SESSION_REFUSED,
			function() {
				this.register();
			}.bind(this)
		);

		let connectionInfo = localStorage.getItem(ClientSession.STORAGE_KEY);
		if (connectionInfo) {
			connectionInfo = JSON.parse(connectionInfo);
			this.sessionId = connectionInfo.id;
			this.sessionToken = connectionInfo.token;
		}

		if (this.sessionId || this.sessionId === 0) {
			this.authenticate();
		} else {
			this.register();
		}
	}

	authenticate() {
		this.connection.send(
			ServerSession.SET_SESSION,
			{
				id: this.sessionId,
				token: this.sessionToken
			}
		);
	}

	register() {
		this.connection.send(ServerSession.GET_SESSION);
	}

}

ClientSession.STORAGE_KEY = 'fpt-session';
