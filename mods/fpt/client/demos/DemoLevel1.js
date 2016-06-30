
import Level from '../../levels/Level';

let DemoLevel1 = Level.createClass({

	terrainGeneration: {
		enabled: true,
		solver: generate,
		range: {
			low: {
				x: -20,
				y: -1,
				z: -20
			},
			high: {
				x: 20,
				y: 10,
				z: 20
			}
		},
	},

	importPath: false, //'/client/demos/demoLevel1.exported.json',

});

const GROUND_LEVEL = 0;

function generate(x, y, z) {
	var funcs = [ground, wall];
	var result = 0;

	funcs.forEach(function(func) {
		var newResult = func(x, y, z);
		if (newResult) {
			result = newResult;
		}
	});

	return result;
}

function ground(x, y, z) {
	if (y === GROUND_LEVEL) {
		return 1;
	}
}


const WALLS = [
	{
		height: 5,
		width: 10,
		x: -20,
		y: 10,
		z: 0
	},
	{
		height: 40,
		width: 60,
		x: -30,
		y: 20,
		z: 0
	}
];

function wall(x, y, z) {

	var found = WALLS.find(function(wall) {

		if (x === wall.x) {
			if (
				y >= Math.floor(wall.y - (wall.height / 2)) &&
				y <= Math.floor(wall.y + (wall.height / 2))
			) {
				if (
					z >= Math.floor(wall.z - (wall.width / 2)) &&
					z <= Math.floor(wall.z + (wall.width / 2))
				) {
					return true;
				}
			}
		}

	});

	if (found) {
		return 2;
	}

}



export default DemoLevel1;
