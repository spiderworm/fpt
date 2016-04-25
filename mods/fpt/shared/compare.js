
let compare = {
	arrays: function(a, b) {
		if (a === b) {
			return true;
		}
		
		if (a.length !== b.length) {
			return false;
		}
		
		if (a.find(
			function(val,i) { return b[i] !== val; }
		)) {
			return false;
		}

		return true;
	}
};

export default compare;
