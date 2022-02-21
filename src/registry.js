import { assert } from "./assert.js";
import { NULL, RESERVED } from "./constants.js";
import { combine, construct, toId, toVersion } from "./sparse_id.js";
import { Iterator, SparseMap } from "./sparse_map.js";
import { Vector } from "./stl.js";
import { View } from "./view.js";

export class Registry {
	/**
	 * @returns {number} new entity id
	 */
	create() {
		let id = NULL;
		if (this.#freeList === NULL) {
			id = this.#gen_id(this.#entities.length);
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

	emplace(entity, pool, component) {
		/** @type {SparseMap} */
		let p = this.#pools.get(pool);
		if (!p) {
			this.#pools.set(pool, new SparseMap());
			p = this.#pools.get(pool);
			p.type = component.constructor;
		}
		
		assert(() => p.type == component.constructor, "Attempting to mix types with a pool");
		p.emplace(entity, component);
	}

	/**
	 * @param {number} entity
	 */
	valid(entity) {
		let id = toId(entity);
		return id < this.#entities.length && this.#entities[id] == entity;
	}

	/**
	 * 
	 * @param  {...string} components Pool names
	 */
	view(...components) {
		assert(() => components.length > 0, "Attempting to iterate a view with no components");
		let comps = new Map();
		let smallest = null;
		let smallestSize = Number.MAX_SAFE_INTEGER;
		for (let component of components) {
			assert(() => this.#pools.has(component), `Attempting to create a view without registered component (${component})`);
			let pool = this.#pools.get(component);
			let size = pool.size();
			if (smallestSize > size) {
				smallest = component;
				smallestSize = size;
			}

			comps.set(component, pool);
		}

		return new View(this, comps, smallest);
	}

	/**
	 * 
	 * @param {number} pos the new entities position
	 * @returns 
	 */
	#gen_id = (pos) => {
		assert(() => pos < toId(NULL), "No more entities available");
		return pos;
	}

	#recycle_id = () => {
		assert(() => this.#freeList != NULL, "Freelist is empty, but attempted to recycle id");
		const cur = toId(this.#freeList);
		this.#freeList = combine(this.#entities[cur], RESERVED);
		return this.#entities[cur] = combine(cur, this.#entities[cur]);
	}

	/**
	 * Release the entity and place it in the free list
	 * @param {number} entity Entity to rease
	 * @param {number} version Desired version, if the reserverd set will changed to 0
	 * @returns {number} Version actually set
	 */
	#release_id = (entity, version) => {
		// if version is equal to the reserved value add one so it loops over when masked and changes to 0
		const ver = version + (version == toVersion(RESERVED))
		this.#entities[toId(entity)] = construct(this.#freeList, ver);
		this.#freeList = combine(entity, RESERVED);
		return ver;
	}

	/** @type {Map<string, SparseMap>} */
	#pools = new Map();
	/** @type {Array<number>} */
	#entities = new Vector();
	#freeList = NULL;
}