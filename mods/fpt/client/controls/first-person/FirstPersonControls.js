
import System from '../../../game/ecs/System';
import {Stream} from 'stream';
import FirstPersonMouse from './FirstPersonMouse';
import FirstPersonKeyboard from './FirstPersonKeyboard';

var FirstPersonControls = System.createClass({
	constructor: function (opts) {
		this.mouse = new FirstPersonMouse(opts);
		this.systems.add(this.mouse);
		this.keyboard = new FirstPersonKeyboard(opts);
		this.systems.add(this.keyboard);
	}
});

FirstPersonControls.prototype.setTarget = function(entity, yaw, pitch, roll) {
	this.keyboard.setTarget(entity);
	this.mouse.setTargets(entity, yaw, pitch, roll);
};

export default FirstPersonControls;
