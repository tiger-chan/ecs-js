export as namespace ecs;
export default ecs;
export = ecs;

declare namespace ecs {
	/**
	 * Null value of an entity
	 */
	export const NULL: number;
	/**
		 *
		 * @param {number} x
		 * @returns {number} Version number
		 */
	export function toVersion(x: number): number;

	/**
	 * 
	 * @param {number} x 
	 * @returns {number} Id number
	 */
	export function toId(x: number): number;

	/**
	 * Combines the id of the with the version of the second
	 * @param {number} lhs Id portion is given
	 * @param {number} rhs Version portion is given
	 * @returns {number} lhs.id | rhs.version;
	 */
	export function combine(lhs: number, rhs: number): number;

	/**
	 * creates a new id using the id of the first and attaching the version provided
	 * @param {number} lhs
	 * @param {number} ver
	 */
	export function construct(lhs: number, version: number): number;

	export class SparseId {
		constructor(x: number);

		page(): number;
		pos(): number;
		toNumber(): number;

		id: number;
		version: number;
	}

	export class SparseSetIterator implements Iterator<number, number>, Iterable<number> {
		constructor(dense: Array<number>);
		[Symbol.iterator](): Iterator<number>;
		next(reset?: boolean): IteratorResult<number, number>;
	}

	export class SparseSet<IteratorType = SparseSetIterator> {
		/**
		 * @returns {SparseSetIterator} Iterator for the set
		 */
		each(): IteratorType;
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

		protected get _dense();
		protected _emplace(id: number, handler: {
			push(): void;
			update(pos: any): void;
		});
		protected _erase(id: number, handler: {
			swap: (posA, posB) => void,
			pop: () => void
		});

		protected _get(id: number): number;
	}

	export interface SparseMapIteratorResult<T> {
		id: number;
		value: T;
	}

	export class SparseMapIterator<T> implements Iterable<SparseMapIteratorResult<T>>, Iterator<SparseMapIteratorResult<T>, number, bool> {
		constructor(dense: Array<number>);
		[Symbol.iterator](): Iterator<SparseMapIteratorResult<T>>;
		next(reset?: boolean): IteratorResult<SparseMapIteratorResult<T>, number>;
	}

	export class SparseMap<T> extends SparseSet<SparseMapIterator<T>> {
		constructor(ctor?: new () => T);
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

		type?: new () => T;
	}


	export class ViewIterator<Components extends any[]> implements Iterable<[number, ...Components], number>, Iterable<[number, ...Components]> {
		constructor(components: SparseMap<any>[], leadWith: string);

		[Symbol.iterator](): Iterator<[number, ...Components]>;
		next(reset?: boolean): IteratorResult<[number, ...Components], number>;
	}

	export class View<Components extends any[]> {
		constructor(reg: Registry, components: [...SparseMap<Components>[]], leadWith: string);

		each(): ViewIterator<[...Components]>;

		/**
		 * Retrieve the value stored for the entity and pool requested
		 * @param {number} id
		 * @param {string} component The pool name for the component
		 */
		get<Component>(id: number, component: string): Component;

		combine<T extends any[]>(view: View<T>): View<[...Components, ...T]>;
		
		get _components(): Map<string, SparseMap<any>>;
		get _excludes(): Map<string, SparseMap<any>>;
		get _leadWith(): string;
	}

	export interface IExclusion { exclude: true, name: string };

	export function exclude(name: string): IExclusion;
	
	type ViewComponent = string | IExclusion;

	export class Registry {
		all_of(entity, ...components): boolean;
		any_of(entity, ...components): boolean;

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
		 * Get component for entity from pool
		 * @param entity Entity id
		 * @param pool Name of the pool to retrieve
		 * @returns {Component}
		 */
		get<Component>(entity: number, pool: string): Component;

		remove(entity: number, ...components: string[]): void;

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
		view<T extends any[]>(...components: ViewComponent[]): View<[...T]>;
	}
}