
import Level from '../../../levels/Level';

const GROUND_LEVEL = 1;
const RADIUS = 60;

let StarterLevel = Level.createClass({

	terrainGeneration: {
		enabled: true,
		solver: generate,
		range: {
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
		}
	},

	importPath: false, //'/client/tools/terrain-builder/starterLevel.exported.json',
stuff: null,
});

function generate(x, y, z) {
	if (y === GROUND_LEVEL) {
		return Math.sqrt(x*x + z*z) <= RADIUS ? 1 : 0;
	}
	return 0;
}

export default StarterLevel;
