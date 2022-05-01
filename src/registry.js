/// <reference path="../types/index.d.ts" />

import { assert } from "./assert.js";
import { NULL, RESERVED } from "./constants.js";
import { combine, construct, toId, toVersion } from "./sparse_id.js";
import { SparseMap } from "./sparse_map.js";
import { Vector } from "./stl.js";
import { View } from "./view.js";

/**
 * @param {string} component
 */
export function exclude(component) {
	return {
		exclude: true,
		name: component
	};
}

/**
 * @implements {ecs.Registry}
 */
export class Registry {
	all_of(entity, ...components) {
		for (let component of components) {
			if (!this.#pools.has(component)) {
				this.#pools.set(component, new SparseMap);
			}

			let p = this.#pools.get(component);
			if (!p.contains(entity)) {
				return false;
			}
		}

		return true;
	}

	any_of(entity, ...components) {
		for (let component of components) {
			if (!this.#pools.has(component)) {
				this.#pools.set(component, new SparseMap);
			}

			let p = this.#pools.get(component);
			if (p.contains(entity)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @returns {number} new entity id
	 */
	create() {
		let id = NULL;
		if (this.#freeList === NULL) {
			id = this.#gen_id(this.#entities.size());
			this.#entities.push(id);
		}
		else {
			id = this.#recycle_id();
		}
		return id;
	}

	/**
	 *
	 * @param {number} entity 
	 * @param {number} version preferred (or closest usable) version number after destruction
	 */
	destroy(entity, version = null) {
		if (version != null) {
			version = toVersion(entity) + 1;
		}

		for (let pool of this.#pools) {
			pool[1].remove(entity);
		}

		return this.#release_id(entity, version);
	}

	/**
	 *
	 * @param {number} entity
	 * @param {string} pool 
	 * @param {any} component
	 * @returns {any}
	 */
	emplace(entity, pool, component) {
		let p = this.#pools.get(pool);
		if (!p) {
			this.#pools.set(pool, new SparseMap(component.constructor));
			p = this.#pools.get(pool);
		}
		else if (!p.type) {
			p.type = component.constructor;
		}

		assert(() => p.type == component.constructor, "Attempting to mix types with a pool");
		if (!p.contains(entity)) {
			p.emplace(entity, component);
		}
		return p.get(entity);
	}

	remove(entity, ...components) {
		for (let component of components) {
			if (!this.#pools.has(component)) {
				this.#pools.set(component, new SparseMap);
			}

			let p = this.#pools.get(component);
			p.remove(entity);
		}
	}

	/**
	 * @param {number} entity
	 */
	valid(entity) {
		let id = toId(entity);
		return id < this.#entities.size() && this.#entities[id] == entity;
	}

	view(...components) {
		assert(() => components.length > 0, "Attempting to iterate a view with no components");
		let comps = new Map();
		let excludes = new Map();
		let smallest = null;
		let smallestSize = Number.MAX_SAFE_INTEGER;
		for (let component of components) {
			let compName = component;
			let poolAdd = (name, pool) => {
				comps.set(name, pool);
			}
			let getMin = (comp, size) => {
				if (smallestSize > size) {
					return [comp, size];
				}
				return [smallest, smallestSize];
			}
			if (typeof(component) == "object") {
				compName = compName.name;
				poolAdd = (name, pool) => {
					excludes.set(name, pool);
				}
				getMin = () => {
					return [smallest, smallestSize];
				}
			}

			if (!this.#pools.has(compName)) {
				this.#pools.set(compName, new SparseMap);
			}

			assert(() => this.#pools.has(compName), `Attempting to create a view without registered component (${compName})`);
			let pool = this.#pools.get(compName);
			[smallest, smallestSize] = getMin(compName, pool.size());
			poolAdd(compName, pool);
		}

		return new View(this, comps, excludes, smallest);
	}

	get(entity, component) {
		if (!this.#pools.has(component)) {
			assert(() => false, "Attempting to retrieve component from entity that doesn't have it");
			return null;
		}

		let pool = this.#pools.get(component);
		assert(() => pool.contains(entity), "Attempting to retrieve component from entity that doesn't have it");
		return pool.get(entity);
	}

	/**
	 * 
	 * @param {number} pos the new entities position
	 * @returns 
	 */
	#gen_id = (pos) => {
		assert(() => pos < toId(NULL), "No more entities available");
		return pos;
	};

	#recycle_id = () => {
		assert(() => this.#freeList != NULL, "Freelist is empty, but attempted to recycle id");
		const cur = toId(this.#freeList);
		this.#freeList = combine(this.#entities[cur], RESERVED);
		return this.#entities[cur] = combine(cur, this.#entities[cur]);
	};

	/**
	 * Release the entity and place it in the free list
	 * @param {number} entity Entity to rease
	 * @param {number} version Desired version, if the reserverd set will changed to 0
	 * @returns {number} Version actually set
	 */
	#release_id = (entity, version) => {
		// if version is equal to the reserved value add one so it loops over when masked and changes to 0
		const ver = version + ((version == toVersion(RESERVED)) ? 1 : 0);
		this.#entities[toId(entity)] = construct(this.#freeList, ver);
		this.#freeList = combine(entity, RESERVED);
		return ver;
	};

	/** @type {Map<string, ecs.SparseMap<any>>} */
	#pools = new Map();
	/** @type {std.Vector<number>} */
	// @ts-ignore
	#entities = new Vector();
	#freeList = NULL;
}