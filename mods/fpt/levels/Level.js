
import System from '../game/ecs/System';
import PiecesComponent from '../game/PiecesComponent';
import Terrain from '../game/terrain/Terrain';
import Entity from '../game/ecs/Entity';

let Level = System.createClass({

	constructor: function() {
		let entity = this.entity = Entity.create();
		let pieces = PiecesComponent.create();
		entity.set('pieces', pieces);
		this.terrain = Terrain.create({solver: this.terrainGeneration.solver});
		if (this.importPath) {
			let x = new XMLHttpRequest();
			x.open('GET', this.importPath, false);
			x.send();
			this.import(JSON.parse(x.responseText));
		}
		if (this.terrainGeneration.enabled) {
			this.terrain.generateRange(this.terrainGeneration.range.low, this.terrainGeneration.range.high);
		}
		pieces.add(this.terrain);
	},

	terrainGeneration: {
		enabled: false,
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
		}
	},

	export: function() {
		return {
			terrain: this.terrain.export()
		};
	},

	import: function(exported) {
		if (!this.generate) {
			this.terrain.import(exported.terrain);
		}
	},

	onLoaded: function(callback) {
		setTimeout(callback, 3000);
	}

});

Level.createClass = function(props) {
	function Klass() {
		Level.call(this);
		props.constructor.apply(this,arguments);
	};
	Klass.prototype = props;
	props.__proto__ = Level.prototype;
	return Klass;
};

export default Level;
