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
	};

	let a = new Array(size);
	a.back = back.bind(a);
	a.resize = resize.bind(a);
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
