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
 * @param {number} x
 * @returns {number} Id number
 */
export function toId(x) {
	return x & ID_MASK;
}

/**
 * Combines the id of the with the version of the second
 * @param {number} lhs Id portion is given
 * @param {number} rhs Version portion is given
 * @returns {number} lhs.id | rhs.version;
 */
export function combine(lhs, rhs) {
	const vMask = VERSION_MASK << VERSION_SHIFT;
	return (lhs & ID_MASK) | (rhs & vMask);
}

/**
 * creates a new id using the id of the first and attaching the version provided
 * @param {number} lhs
 * @param {number} ver
 */
export function construct(lhs, ver) {
	return toId(lhs) | (ver << VERSION_SHIFT);
}

/**
 * @implements {Ecs.SparseId}
 */
export class SparseId {
	/**
	 * @param {number} x
	 */
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
