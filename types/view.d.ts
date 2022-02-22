declare class ViewIterator<Components extends any[]> implements Iterable<[number, ...Components], number>, Iterable<[number, ...Components]> {
	constructor(components: SparseMap<any>[], leadWith: string);

	[Symbol.iterator](): Iterator<[number, number, ...Components]>;
	next(reset?: boolean): IteratorResult<[number, number, ...Components], number>;
}

declare class View<Components extends any[]> {
	constructor(reg: Registry, components: [...SparseMap<Components>[]], leadWith: string);

	each(): ViewIterator<Components>;

	/**
	 * Retrieve the value stored for the entity and pool requested
	 * @param {number} id
	 * @param {string} component The pool name for the component
	 */
	get<Component>(id: number, component: string): Component;
}