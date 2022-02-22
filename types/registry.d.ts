/// <reference path="./view.d.ts" />

declare class Registry {
	/**
	 * @returns {number} new entity id
	 */
	create(): number;

	/**
	 *
	 * @param {number} entity 
	 * @param {number} version preferred (or closest usable) version number after destruction
	 * @returns {number} Version number after the destruction 
	 */
	destroy(entity: number, version?: number): number;

	/**
	 * 
	 * @param entity Entity id
	 * @param pool Name of the pool to insert the component
	 * @param component Component instance to insert
	 * @returns {T} The component that was inserted
	 */
	emplace<T>(entity: number, pool: string, component: T): T;

	/**
	 * Checks the validity of entity
	 * @param {number} entity Entity
	 * @returns {boolean} true if valid, false otherwise
	 */
	valid(entity: number): boolean;

	/**
	 * Returns a view which can be iterated
	 * @param components Pool names
	 */
	view(...components: string[]): View;
}
