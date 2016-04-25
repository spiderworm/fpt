
import System from './ecs/System';
import EntityCollection from './ecs/EntityCollection';
import Ticker from './Ticker';
import Physics from './physics/Physics';
import Level from '../levels/Level';

var FPTGame = System.createClass({

	constructor: function() {
		this.entities = EntityCollection.create();

		this.physics = Physics.create(this);

		this.systems.add(this.physics);

		this._ticker = Ticker.create(1000/60, this.tick.bind(this));
	},

	setLevel: function(level) {
		this.level = level;
		this.systems.add(level);
		this.entities.add(level.entity);
		this.level.onLoaded(this.start.bind(this));
	},

	start: function() {
		this.physics.playing = true;
	}

});

FPTGame.create = function() {
	return new FPTGame();
};

export default FPTGame;
