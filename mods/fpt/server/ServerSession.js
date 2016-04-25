
class ServerSession {
	
	static create() {
		return new ServerSession();
	}

	constructor() {
		this.id = null;
		this.token = null;
		this.connection = null;
	}

}

ServerSession.GET_SESSION = 'get-session';
ServerSession.SET_SESSION = 'set-session';
ServerSession.SESSION_REFUSED = 'session-refused';

export default ServerSession;
