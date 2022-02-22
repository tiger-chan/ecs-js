/// <reference path="./sparse_set.d.ts" />

declare interface SparseMapIteratorResult<T> {
	id: number;
	value: T;
}

declare class SparseMapIterator<T> implements Iterator<SparseMapIteratorResult<T>, number>, Iterable<SparseMapIteratorResult<T>> {
	constructor(dense: Array<number>);
	[Symbol.iterator](): Iterator<SparseMapIteratorResult<T>>;
	next(reset?: boolean): IteratorResult<SparseMapIteratorResult<T>, number>;
}

declare class SparseMap<T> extends SparseSet {
	/**
	 * @returns {SparseMapIterator} Iterator for the set
	 */
	override each(): SparseMapIterator<T>;

	/**
	 *
	 * @param {number} id preferred id to emplace if available
	 * @param {T} data The data to emaplce
	 * @returns {number} id of emplaced entry
	 */
	emplace(id: number, data?: T): number;

	/**
	 * Get the value stored for the id provided
	 * @param id Id
	 * @returns {T} The stored data
	 */
	get(id: number): T;

	/**
	 * Replace the data stored in the map
	 * @param {number} id Id
	 * @param {T} data Data to replace what is stored
	 */
	patch(id: number, data: T): void;
}
