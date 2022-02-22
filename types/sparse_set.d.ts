declare class SparseSetIterator implements Iterator<number, number>, Iterable<number> {
	constructor(dense: Array<number>);
	[Symbol.iterator](): Iterator<number>;
	next(reset?: boolean): IteratorResult<number, number>;
}

declare class SparseSet {
	/**
	 * @returns {SparseSetIterator} Iterator for the set
	 */
	each(): SparseSetIterator | any;
	/**
	 * 
	 * @param id Id to test the presence of
	 * @returns {boolean} True if the id is present in the set, false otherwise
	 */
	contains(id: number): boolean;
	/**
	 *
	 * @param {number} id preferred id to emplace if available
	 * @returns {number} id of emplaced entry
	 */
	emplace(id: number): number;

	/**
	* 
	* @param {number} id 
	*/
	erase(id: number): void;

	/**
	 * Remove entry if present
	 * @param {number} id
	 * @returns {boolean} returns true if removed, false if it wasn't contained.
	 */
	remove(id: number): boolean;

	/**
	 * @returns {number} The size of the collection
	 */
	size(): number;
}