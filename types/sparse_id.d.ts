/**
 * 
 * @param {number} x 
 * @returns {number} Version number
 */
declare function toVersion(x: number): number;

/**
 * 
 * @param {number} x 
 * @returns {number} Id number
 */
declare function toId(x: number): number;

/**
 * Combines the id of the with the version of the second
 * @param {number} lhs Id portion is given
 * @param {number} rhs Version portion is given
 * @returns {number} lhs.id | rhs.version;
 */
declare function combine(lhs: number, rhs: number): number;

/**
 * creates a new id using the id of the first and attaching the version provided
 * @param {number} lhs
 * @param {number} ver
 */
declare function construct(lhs: number, version: number): number;

declare class SparseId {
	constructor(x: number);

	page(): number;
	pos(): number;
	toNumber(): number;

	id: number;
	version: number;
}
