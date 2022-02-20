/**
 * 
 * @param {number} size Array Length
 * @returns {Array<any>}
 */
export function Vector(size = 0) {
	let back = function () {
		if (this.length > 0) {
			return this[this.length - 1];
		}
		return null;
	};

	let resize = function (newSize, defaultValue) {
		while (newSize > this.length)
			this.push(defaultValue);
		this.length = newSize;
	}
	let a = new Array(size);
	a.back = back.bind(a);
	a.resize = resize.bind(a);
	return a;
}