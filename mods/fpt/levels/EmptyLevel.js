
import Level from './Level';

let EmptyLevel = Level.createClass({

	terrainGeneration: {
		enabled: true,
		solver: function() { return 0; },
		range: {
			low: {
				x: 0,
				y: 0,
				z: 0
			},
			high: {
				x: 0,
				y: 0,
				z: 0
			}
		},
	},

	importPath: false,

});

export default EmptyLevel;
