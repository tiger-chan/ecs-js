/**
 * 
 * @param {number} size 
 * @returns {Array<any>}
 */
export function FixedArray(size) {
	let a = new Array(size);

	a.__size = 0;
	let capacity = function () {
		return this.length;
	};

	let newSize = function () {
		return this.__size;
	};

	let resize = function (newSize) {
		if (this.__size < newSize && newSize < this.__size) {
			this.__size = newSize;
		}
	};

	let newPush = function (x) {
		if (this.__size < size) {
			return this[this.__size++] = x;
		} else {
			return undefined;
		}
	};

	let newPop = function () {
		if (0 < this.__size) {
			this[--this.__size] = undefined;
		}
	};

	a.capacity = capacity.bind(a);
	a.size = newSize.bind(a);
	a.push = newPush.bind(a);
	a.pop = newPop.bind(a);
	a.resize = resize.bind(a);

	if (Object.seal) {
		// fill array with some value because
		// empty slots can not be changed after calling Object.seal
		a.fill(undefined);

		Object.seal(a);
		// now a is a fixed-size array with mutable entries
	}
	return a;
}
