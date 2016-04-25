
import Entity from '../ecs/Entity';
import PhysicsComponent from '../physics/PhysicsComponent';

let TerrainPiece = Entity.createClass({
	constructor: function(options) {
		var physics = PhysicsComponent.create();
		physics.cannon = options.cannon;
		this.set('physics', physics);
	}
});

TerrainPiece.create = function(options) {
	return new TerrainPiece(options);
};

export default TerrainPiece;
