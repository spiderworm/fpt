
import THREE from 'three';

class MeshComponent {

	static create() {
		return new MeshComponent();
	}

	constructor() {
		let geometry = new THREE.CubeGeometry(1, 1, 1);
		let material = new THREE.MeshLambertMaterial({color: 0x0000ff, wireframe: false});
		this.three = new THREE.Mesh(geometry, material);
		this.three.castShadow = this.three.receiveShadow = true;
		this.three.useQuaternion = true;
	}

}

export default MeshComponent;
