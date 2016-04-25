
import FPTGame from '../game/FPTGame';
import FPTGameView from './view/FPTGameView';
import TestLevel1 from '../levels/TestLevel1';
import ClientConnection from './ClientConnection';
import ClientSession from './ClientSession';

export default class FPTClient {

	constructor() {
		this.game = FPTGame.create();
		this.game.setLevel(TestLevel1.create());
		this.view = FPTGameView.create(this.game);

		this.connection = ClientConnection.create();
		this.session = ClientSession.create(this.connection);
	}

	static create() {
		return new FPTClient();
	}

};
