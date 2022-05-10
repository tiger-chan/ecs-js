/// <reference path="../types/index.d.ts" />
/// <reference path="../types/stl.d.ts" />

/**
 * @template T
 * @implements {std.Vector<T>}
 */
export class Vector extends Array {
	constructor(arrayLength = 1) {
		super(arrayLength);

		this.fill(null);
		this.__capacity = arrayLength;
	}

	back() {
		if (0 < this.__size) {
			return this[this.__size - 1];
		}
		return null;
	}

	resize(newSize) {
		if (newSize > this.__capacity) {
			// Allocate more space
			this.__capacity = newSize;
			while (this.length < newSize) {
				super.push(null);
			}
		}

		return this.__size = newSize;
	}

	capacity() {
		return this.__capacity;
	}

	size() {
		return this.__size;
	}

	push(x) {
		if (this.__size < this.__capacity) {
			return this[this.__size++] = x, this.__size;
		}

		this.__capacity = Math.max(this.__capacity, 1) * 2;
		while (this.length < this.__capacity) {
			super.push(null);
		}

		return this[this.__size++] = x, this.__size;
	}

	pop() {
		if (0 < this.__size) {
			let a = this[--this.__size];
			return this[this.__size] = null, a;
		}
		return null;
	}

	__size = 0;
	__capacity = 0;
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

export default {
	ctz
	, clz
	, cto
	, clo
	, Vector
};
