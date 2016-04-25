
import System from '../ecs/System';
import CANNON from 'cannon';
import FPTGame from '../FPTGame';


var Physics = System.createClass({

	constructor: function(fptGame) {

		this.playing = false;

		this.entities = fptGame.entities;

		var world = new CANNON.World();
		world.gravity = new CANNON.Vec3(0, -9.8, 0);
		world.broadphase = new CANNON.NaiveBroadphase();
		var solver = new CANNON.GSSolver();
		solver.iterations = 7;
		world.defaultContactMaterial.contactEquationRegularizationTime = 0.55;
		solver.tolerance = 0.01;
		world.solver = solver;

		world.quatNormalizeFast = true;
		world.quatNormalizeSkip = 0;

		world.defaultContactMaterial.friction = 0.7;
		world.defaultContactMaterial.restitution = 0.0;
		world.defaultContactMaterial.contactEquationStiffness = 1e9;
		world.defaultContactMaterial.contactEquationRegularizationTime = 4;
		world.broadphase.useBoundingBoxes = true;
		world.allowSleep = false;

		this.world = world;
	},

	tick: function(ms, entityCollection) {
		this.entities.forEach(this._prepareEntity.bind(this));
		if (this.playing) {
			this.world.step(ms/1000);
		}
		this.tickSubsystems(ms);
	},

	_prepareEntity: function(entity) {
		let pieces = entity.get('pieces');
		if (pieces) {
			pieces.forEach(function(piece) {
				this._prepareEntity(piece);
			}.bind(this));
		}
		let physics = entity.get('physics');
		if (physics) {
			if (!physics.ready) {
				this.world.add(physics.cannon);
				physics.constraints.forEach(function(constraint) {
					console.info('adding constraint');
					this.world.addConstraint(constraint);
				}.bind(this));
			}
			physics.ready = true;
		}
	}

});

Physics.create = function(fptGame) {
	return new Physics(fptGame);
}

export default Physics;
