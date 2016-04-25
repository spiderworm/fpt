
import Webserver from './Webserver';
import FPTGame from '../game/FPTGame';
import TestLevel1 from '../levels/TestLevel1';
import ws from 'ws';
import ServerSessionManager from './ServerSessionManager';

class FPTServer {

	static create() {
		return new FPTServer();
	}

	start() {
		let socketServer = new ws.Server({ port: 3001 });
		let sessionManager = ServerSessionManager.create(socketServer);

		sessionManager.onSession(function(session) {
			console.log(session);
		});

		let webserver = Webserver.create();
		let game = FPTGame.create();
		game.setLevel(TestLevel1.create());
	}

}

export default FPTServer;
