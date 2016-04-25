
import Level from './Level';
import voxel from 'voxel';

let TestLevel1 = Level.createClass({
	generateVoxel: voxel.generator['Hill']
});

TestLevel1.create = function() {
	return new TestLevel1();
};

export default TestLevel1;
