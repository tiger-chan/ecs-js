/// <reference path="../types/index.d.ts" />
/// <reference path="../types/stl.d.ts" />

/**
 * @param {number} size Array Length
 */
export function Vector(size = 0) {
	/** @type {std.Vector<any>} */
	let a = new Array(size);

	a.__size = 0;
	let back = function () {
		if (0 < this.__size) {
			return this[this.__size - 1];
		}
		return null;
	}

	let capacity = function () {
		return this.length;
	};

	let newSize = function () {
		return this.__size;
	};

	/** @this {std.Vector<any>} */
	const resize = function (newSize, defaultValue) {
		// @ts-ignore
		while (newSize > this.length)
			// @ts-ignore
			this.push(defaultValue);
		this.length = newSize;
		return this.length;
	};

	let oldPush = Array.prototype.push;
	/** @this {std.Vector<any>} */
	let newPush = function (x) {
		this.__size++;
		return oldPush.call(this, x);
	};

	/** @this {std.Vector<any>} */
	let newPop = function () {
		if (0 < this.__size) {
			--this.__size;
			let val = this[this.__size];
			delete this[this.__size];
			this.length = this.__size;
			return val;
		}
		return undefined;
	};

	a.capacity = capacity.bind(a);
	a.size = newSize.bind(a);
	a.push = newPush.bind(a);
	a.pop = newPop.bind(a);
	a.resize = resize.bind(a);
	a.back = back.bind(a);
	a.length = size;
	return a;
}

/**
 * Count Trailing zeros
 * @param {number} x
 * @returns {number} The number of trailing zeros
 */
export function ctz(x) {
	// https://en.wikipedia.org/wiki/Find_first_set#CTZ
	x >>>= 0;
	if (x == 0) { return 32; }
	let n = 0;
	if ((x & 0x0000FFFF) == 0) { n += 16; x >>= 16; }
	if ((x & 0x000000FF) == 0) { n += 8; x >>= 8; }
	if ((x & 0x0000000F) == 0) { n += 4; x >>= 4; }
	if ((x & 0x00000003) == 0) { n += 2; x >>= 2; }
	if ((x & 0x00000001) == 0) { n += 1; }
	return n;
}

/**
 * Count Leading zeros
 * @param {number} x
 * @returns {number} The number of leading zeros
 */
export function clz(x) {
	// https://en.wikipedia.org/wiki/Find_first_set#CLZ
	x >>>= 0;
	if (x == 0) { return 32; }
	let n = 0;
	if ((x & 0xFFFF0000) == 0) { n += 16; x <<= 16; }
	if ((x & 0xFF000000) == 0) { n += 8; x <<= 8; }
	if ((x & 0xF0000000) == 0) { n += 4; x <<= 4; }
	if ((x & 0xC0000000) == 0) { n += 2; x <<= 2; }
	if ((x & 0x80000000) == 0) { n += 1; }
	return n;
}

/**
 * Count Leading ones
 * @param {number} x
 * @returns {number} The number of leading ones
 */
export function cto(x) {
	return ctz(~x);
}

/**
 * Count Leading ones
 * @param {number} x
 * @returns {number} The number of leading ones
 */
export function clo(x) {
	return clz(~x);
}
