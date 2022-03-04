/// <reference path="../types/index.d.ts" />

import { assert } from "./assert.js";

/**
 * @implements {Ecs.ViewIterator}
 */
class ViewIterator {
	/**
	 *
	 * @param {Map<string, Ecs.SparseMap<any>>} components
	 * @param {string} leadWith
	 */
	constructor(components, excludes, leadWith) {
		this.#components = components;
		this.#excludes = excludes;
		this.#leadWith = leadWith;
	}

	*[Symbol.iterator]() {
		let iter = this.#components.get(this.#leadWith).each();
		let result = iter.next();
		while (!result.done) {
			if (typeof (result.value) != "number") {
				const rValue = result.value;
				let id = rValue.id;
				let entity = this.#buildEntityIfValid(id);
				if (entity) {
					yield entity;
				}
			}

			result = iter.next();
		}
	}

	/**
	 * 
	 * @param {boolean} [reset=false]
	 * @returns {IteratorResult<[number, ...any], number>}
	 */
	next(reset) {
		if (reset || !this.#iter) {
			this.#iter = this.#components.get(this.#leadWith).each();
			this.#itCount = 0;
		}

		this.#iterResult = this.#iter.next();
		while (!this.#iterResult.done) {
			let entity = this.#buildEntityIfValid(this.#iterResult.value.id);
			if (entity) {
				++this.#itCount;

				/** @type {IteratorYieldResult<[number, ...any]>} */
				let result = {
					value: entity
				};

				return result;
			}
			this.#iterResult = this.#iter.next();
		}

		this.#iter = null;
		/** @type {IteratorReturnResult<number>} */
		let result = { value: this.#itCount, done: true };
		return result;
	}

	/**
	 *
	 * @param {number} entity
	 * @returns {[number, ...any]}
	 */
	#buildEntityIfValid = (entity) => {
		/** @type {[number, ...any]} */
		let e = [entity];
		
		for (let pool of this.#excludes) {
			if (pool[1].contains(entity)) {
				return null;
			}
		}

		for (let pool of this.#components) {
			if (!pool[1].contains(entity)) {
				return null;
			}
			e.push(pool[1].get(entity));
		}

		return e;
	};

	/** @type {Map<string, Ecs.SparseMap<any>>} */
	#components = null;
	/** @type {Map<string, Ecs.SparseMap<any>>} */
	#excludes = null;
	/** @type {string} */
	#leadWith = null;


	/** @type {Ecs.SparseMapIterator<any>} */
	#iter = null;
	/** @type {IteratorResult<any>} */
	#iterResult = null;
	/** @type {number} */
	#itCount = 0;
}

/**
 * @implements {Ecs.View}
 */
export class View {
	/**
	 * 
	 * @param {Ecs.Registry} reg
	 * @param {Map<string, Ecs.SparseMap<any>>} components
	 * @param {string} leadWith
	 */
	constructor(reg, components, excludes, leadWith) {
		this.#reg = reg;
		this.#components = components;
		this.#excludes = excludes;
		this.#leadWith = leadWith;
	}

	/**
	 *
	 * @param {Ecs.View} otherView
	 * @returns {Ecs.View}
	 */
	combine(otherView) {
		let comps = new Map(this.#components);
		for (let comp of otherView._components) {
			comps.set(comp[0], comp[1]);
		}

		let excludes = new Map(this.#excludes);
		for (let comp of otherView._excludes) {
			comps.set(comp[0], comp[1]);
		}

		let leadWith = this.#leadWith;
		let leadWithComp = comps.get(leadWith);
		let leadWithOtherComp = comps.get(otherView._leadWith);
		if (leadWithComp.size() > leadWithOtherComp.size()) {
			leadWith = otherView._leadWith;
		}

		return new View(this.#reg, comps, excludes, leadWith);
	}

	/**
	 *
	 * @returns {Ecs.ViewIterator<any[]>}
	 */
	each() {
		return new ViewIterator(new Map(this.#components), new Map(this.#excludes), this.#leadWith);
	}

	/**
	 * 
	 * @param {number} id 
	 * @param {string} component 
	 * @returns {any} Component object
	 */
	get(id, component) {
		assert(() => this.#components.has(component), "Attempting to retrieve component that isn't present in view");
		assert(() => this.#reg.valid(id), "Attempting to use entity not present in registry");

		let pool = this.#components.get(component);
		assert(() => pool.contains(id), `Cannot retrieve component, it has not been assigned to ${id}`);
		return pool.get(id);
	}

	get _components() {
		return this.#components;
	}

	get _excludes() {
		return this.#excludes;
	}

	get _leadWith() {
		return this.#leadWith;
	}

	/** @type {Ecs.Registry} */
	#reg = null;
	/** @type {Map<string, Ecs.SparseMap<any>>} */
	#components = null;
	/** @type {Map<string, Ecs.SparseMap<any>>} */
	#excludes = null;
	/** @type {string} */
	#leadWith = null;
}