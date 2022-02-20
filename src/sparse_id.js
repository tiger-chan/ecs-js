import { PAGE_SIZE, ID_MASK, VERSION_MASK, VERSION_SHIFT } from "./constants.js";

/**
 * 
 * @param {number} x 
 * @returns {number} Version number
 */
export function toVersion(x) {
	return (x >> VERSION_SHIFT) & VERSION_MASK;
}

/**
 * 
 * @param {number} id 
 * @returns {number} Id number
 */
export function toId(x) {
	return x & ID_MASK;
}

/**
 * 
 * @param {number} lhs Id portion is given
 * @param {number} rhs Version portion is given
 * @returns {number} lhs.id | rhs.version;
 */
export function combine(lhs, rhs) {
	const vMask = VERSION_MASK << VERSION_SHIFT;
	return (lhs & ID_MASK) | (rhs & vMask);
}

export class SparseId {
	/** @type {number} */
	constructor(x) {
		this.id = toId(x);
		this.version = toVersion(x);
	}

	page() {
		return Math.floor(this.id / PAGE_SIZE);
	}

	pos() {
		return this.id % PAGE_SIZE;
	}

	toNumber() {
		return combine(this.id, (this.version << VERSION_SHIFT));
	}
}
