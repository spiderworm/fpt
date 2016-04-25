
import System from '../game/ecs/System';
import PiecesComponent from '../game/PiecesComponent';
import Terrain from '../game/terrain/Terrain';
import Entity from '../game/ecs/Entity';

let Level = System.createClass({

	constructor: function() {
		let entity = this.entity = Entity.create();
		let pieces = PiecesComponent.create();
		entity.set('pieces', pieces);
		this.terrain = Terrain.create({
			solver: this.generateSolver
		});
		if (this.exported) {
			let x = new XMLHttpRequest();
			x.open('GET', this.exported, false);
			x.send();
			this.import(JSON.parse(x.responseText));
		}
		if (this.generate) {
			this.terrain.generateRange(this.generateRange.low, this.generateRange.high);
		}
		pieces.add(this.terrain);
	},

	generate: true,

	generateSolver: function(x, y, z) {
		return 0;
	},

	generateRange: {
		low: {
			x: -1,
			y: -1,
			z: -1
		},
		high: {
			x: 1,
			y: 1,
			z: 1
		}
	},

	exported: null,

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
