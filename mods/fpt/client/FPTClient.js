
import FPTGame from '../game/FPTGame';
import FPTGameView from './view/FPTGameView';
import EmptyLevel from '../levels/EmptyLevel';
import ClientConnection from './ClientConnection';
import ClientSession from './ClientSession';

export default class FPTClient {

	constructor() {
		this.game = FPTGame.create();
		this.game.setLevel(new EmptyLevel());
		this.view = FPTGameView.create(this.game);

		this.connection = ClientConnection.create();
		this.session = ClientSession.create(this.connection);
	}

	static create() {
		return new FPTClient();
	}

};
