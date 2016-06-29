
import FPTGame from '../../../game/FPTGame';
import FPTGameView from '../../view/FPTGameView';
import StarterLevel from './StarterLevel';
import FirstPersonControls from '../../controls/first-person/FirstPersonControls';
import BuilderCharacter from '../../../game/characters/builder/Builder';
import PhysicsDebugView from '../../view/PhysicsDebugView';

export default class LevelBuilder {

	constructor() {
		this.game = FPTGame.create();
		this.game.setLevel(StarterLevel.create());
		this.view = FPTGameView.create(this.game);

		let controls = new FirstPersonControls();
		this.game.systems.add(controls);

		let character = new BuilderCharacter();
		character.get('physics').position = {x: 20, y: 5, z: 0};
		character.get('pieces').get('head').get('physics').position = {x: 0, y: 10, z: 0};
		this.game.entities.add(character);

/*
		setInterval(function() {
			character.get('physics').cannon.angularVelocity.set(0, .5, 0);
		},100);
*/

		controls.setTarget(
			character,
			character,
			character.get('pieces').get('head'),
			character.get('pieces').get('head')
		);

		let physicsDebugView = PhysicsDebugView.create(this.view);
		this.view.systems.add(physicsDebugView);

		//setInterval(function() { console.debug(entityPhysics.position); }, 500);

		//controls.setTarget(entity, null, null, null);

/*
  controls.setTarget(gameItem);
  this._camera.possess(gameItem);
  this._camera.pov(3);
*/



	}

	static create() {
		return new LevelBuilder();
	}

};
