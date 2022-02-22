/// <reference path="../types/sparse_map.d.ts" />
/// <reference path="../types/registry.d.ts" />

import { assert } from "./assert.js";

class ViewIterator {
	/**
	 * 
	 * @param {Map<string, SparseMap<any>>} components
	 * @param {string} leadWith
	 */
	constructor(components, leadWith) {
		this.#components = components;
		this.#leadWith = this.#components.get(leadWith);
		this.#components.delete(leadWith);
	}

	*[Symbol.iterator]() {
		let iter = this.#leadWith.each();
		let result = iter.next();
		while (!result.done) {
			/** @type {SparseMapIteratorResult<any>} */
			const rValue = result.value;
			let id = rValue.id;
			let entity = this.#buildEntityIfValid(id, rValue.value);
			if (entity) {
				yield entity;
			}
			result = iter.next();
		}
	}

	next(reset) {
		if (reset || !this.#iter) {
			this.#iter = this.#leadWith.each();
			this.#itCount = 0;
		}
		
		this.#iterResult = this.#iter.next();
		while (!this.#iterResult.done) {
			let entity = this.#buildEntityIfValid(this.#iterResult.value.id, this.#iterResult.value.value);
			if (entity) {
				++this.#itCount;
				return {
					value: entity,
					done: false
				};
			}
			this.#iterResult = this.#iter.next();
		}

		if (this.#iterResult.done) {
			this.#iter = null;
			return { value: this.#itCount, done: true };
		}
	}

	#buildEntityIfValid = (entity, leadValue) => {
		let e = [entity, leadValue];
		for (let pool of this.#components) {
			if (!pool[1].contains(entity)) {
				return null;
			}
			e.push(pool[1].get(entity));
		}

		return e;
	};

	/** @type {Map<string, SparseMap>} */
	#components = null;
	/** @type {SparseMap} */
	#leadWith = null;


	/** @type {SparseMapIterator} */
	#iter = null;
	/** @type {IteratorResult<any>} */
	#iterResult = null;
	/** @type {number} */
	#itCount = 0;
}

export class View {
	/**
	 * 
	 * @param {Registry} reg 
	 * @param {Map<string, SparseMap>} components 
	 * @param {string} leadWith
	 */
	constructor(reg, components, leadWith) {
		this.#reg = reg;
		this.#components = components;
		this.#leadWith = leadWith;
	}

	each() {
		return new ViewIterator(new Map(this.#components), this.#leadWith);
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

	/** @type {Registry} */
	#reg = null;
	/** @type {Map<string, SparseMap>} */
	#components = null;
	/** @type {string} */
	#leadWith = null;
}