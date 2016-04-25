
import Entity from '../ecs/Entity';
import PhysicsComponent from '../physics/PhysicsComponent';
import ViewComponent from '../view/ViewComponent';

let TestBall = Entity.createClass({
	constructor: function(options) {
		let physics = PhysicsComponent.create({
			position: options.position,
			rotation: options.rotation
		});
		this.set('physics', physics);
		let viewComponent = ViewComponent.create({
			physics: physics
		});
		this.set('view', viewComponent);
	}
});

TestBall.create = function(options) {
	return new TestBall(options);
};

module.exports = TestBall;
