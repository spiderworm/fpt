
import Level from '../../../levels/Level';

const GROUND_LEVEL = 1;
const RADIUS = 60;

let StarterLevel = Level.createClass({

	generate: true,

	generateSolver: function(x, y, z) {
		if (y === GROUND_LEVEL) {
			return Math.sqrt(x*x + z*z) <= RADIUS ? 1 : 0;
		}
		return 0;
	},

	generateRange: {
		low: {
			x: -40,
			y: 0,
			z: -40
		},
		high: {
			x: 40,
			y: 20,
			z: 40
		}
	},

	exported: false //'/client/tools/terrain-builder/starterLevel.exported.json'

});

StarterLevel.create = function() {
	return new StarterLevel();
};

export default StarterLevel;
