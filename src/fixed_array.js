import { Vector } from "./stl";

/**
 * @constructor
 * @param {number} size
 */
export function FixedArray(size) {
	/** @type {std.FixedArray<any>} */
	// @ts-ignore
	let a = new Vector(size);

	/** @this {std.FixedArray<any>} */
	let resize = function (newSize) {
		if (this.__size < newSize && newSize < this.__size) {
			this.__size = newSize;
		}
		return this.__size;
	};

	/** @this {std.Vector<any>} */
	let newPush = function (x) {
		return this[this.__size++] = x, this.__size;
	};

	/** @this {std.Vector<any>} */
	let newPop = function () {
		if (0 < this.__size) {
			this[--this.__size] = undefined;
		}
	};

	a.resize = resize.bind(a);
	a.push = newPush.bind(a);
	a.pop = newPop.bind(a);

	if (Object.seal) {
		// fill array with some value because
		// empty slots can not be changed after calling Object.seal
		a.fill(undefined);

		Object.seal(a);
		// now a is a fixed-size array with mutable entries
	}
	return a;
}
