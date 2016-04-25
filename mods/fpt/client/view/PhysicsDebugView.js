
import System from '../../game/ecs/System';
import THREE from 'three';
import PhysicsDebugComponent from './PhysicsDebugComponent';
import ConstraintDebugView from './debug/ConstraintDebugView';

let PhysicsDebugView = System.createClass({
	
	constructor: function(fptGameView) {

		this.view = fptGameView;

		this.three = new THREE.Object3D();

		this.threeConstraints = new THREE.Object3D();
		this.three.add(this.threeConstraints);

		this.threeShapes = new THREE.Object3D();
		this.three.add(this.threeShapes);

		this.view.scene.add(this.three);

		this.entities = fptGameView.game.entities;

		this._constraints = [];

	},

	tick: function(ms) {
		this.entities.forEach(function(entity) {
			this.tickEntity(entity);
		}.bind(this));

		this.tickConstraints();
	},

	tickEntity: function(entity) {
		let pieces = entity.get('pieces');

		if (pieces) {
			pieces.forEach(function(piece) {
				this.tickEntity(piece);
			}.bind(this));
		}

		let view = entity.get('physicsDebugView'),
			physics = entity.get('physics');

		if (view && !physics) {
			this.threeShapes.remove(view.three);
		}

		if (!view && physics) {
			view = new PhysicsDebugComponent(entity);
			entity.set('physicsDebugView', view);
		}

		if (view && physics && !view.three.parent) {
			this.threeShapes.add(view.three);
		}

		if (view) {
			view.tick();
		}
	},

	tickConstraints: function() {
		var cannonConstraints = this.view.game.physics.world.constraints;
		cannonConstraints.forEach(function(cannonConstraint) {
			if (
				!this._constraints.find(function(constraintDebugView) {
					return constraintDebugView.cannon === cannonConstraint;
				}.bind(this))
			) {
				let view = new ConstraintDebugView(cannonConstraint);
				this._constraints.push(view);
				this.threeConstraints.add(view.three);
			}
		}.bind(this));

		if (cannonConstraints.length !== this._constraints.length) {
			this._constraints = this._constraints.some(function(view) {
				if (cannonConstraints.indexOf(view.cannon) === -1) {
					this.threeConstraints.remove(view.three);
					return false;
				}
				return true;
			}.bind(this));
		}

		this._constraints.forEach(function(view) {
			view.tick();
		});
	}

});

PhysicsDebugView.create = function(fptGameView) {
	return new PhysicsDebugView(fptGameView);
};

export default PhysicsDebugView;
