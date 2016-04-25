
import Entity from '../../ecs/Entity';
import PhysicsComponent from '../../physics/PhysicsComponent';
import ViewComponent from '../../view/ViewComponent';

function HumanHead() {
	let entity = Entity.create();
	let physics = PhysicsComponent.create();
	physics.dynamicRotation = false;
	entity.set('physics', physics);
	entity.set('view', ViewComponent.create());
	return entity;
};

export default HumanHead;
