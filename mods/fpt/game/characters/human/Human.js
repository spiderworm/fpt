
import Entity from '../../ecs/Entity';
import HumanHead from './HumanHead';
import PiecesComponent from '../../PiecesComponent';
import PhysicsComponent from '../../physics/PhysicsComponent';
import ViewComponent from '../../view/ViewComponent';
import CANNON from 'cannon';


function Human() {
	let entity = Entity.create();

	let physics = PhysicsComponent.create();
	physics.dynamicRotation = false;
	entity.set('physics', physics);
	entity.set('view', ViewComponent.create());

	let pieces = new PiecesComponent();
	entity.set('pieces', pieces);

	pieces.add('head', new HumanHead());




	Object.defineProperty(entity, 'head', {get: function() { return this.get('pieces').get('head'); }});

	var constraint = new CANNON.HingeConstraint(
		physics.cannon,
		entity.head.get('physics').cannon, 
		{
			pivotA: new CANNON.Vec3(0, .5, 0),
			axisA: new CANNON.Vec3(1, 0, 0),
			pivotB: new CANNON.Vec3(0, -.5, 0),
			axisB: new CANNON.Vec3(1, 0, 0),
			maxForce: 1e100
		}
	);
	constraint.collideConnected = false;

	physics.constraints.push(constraint);



/*
	var vecA = new CANNON.Vec3(0, .5, .2);
	var vecB = new CANNON.Vec3(0, -.5, .2);
	var constraint = new CANNON.PointToPointConstraint(
		physics.cannon, vecA,
		entity.head.get('physics').cannon, vecB,
		1e100
	);
	constraint.collideConnected = false;

	physics.constraints.push(constraint);

	var vecA = new CANNON.Vec3(0, .5, -.2);
	var vecB = new CANNON.Vec3(0, -.5, -.2);
	var constraint = new CANNON.PointToPointConstraint(
		physics.cannon, vecA,
		entity.head.get('physics').cannon, vecB,
		1e100
	);
	constraint.collideConnected = false;

	physics.constraints.push(constraint);
*/

	return entity;
};

export default Human;
