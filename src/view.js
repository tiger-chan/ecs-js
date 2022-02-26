/// <reference path="../types/index.d.ts" />

import { assert } from "./assert.js";
import { NULL } from "./constants.js";

/**
 * @implements {Ecs.ViewIterator}
 */
class ViewIterator {
	/**
	 *
	 * @param {Map<string, Ecs.SparseMap<any>>} components
	 * @param {string} leadWith
	 */
	constructor(components, leadWith) {
		this.#components = components;
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
	constructor(reg, components, leadWith) {
		this.#reg = reg;
		this.#components = components;
		this.#leadWith = leadWith;
	}

	/**
	 *
	 * @returns {Ecs.ViewIterator<any[]>}
	 */
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

	/** @type {Ecs.Registry} */
	#reg = null;
	/** @type {Map<string, Ecs.SparseMap<any>>} */
	#components = null;
	/** @type {string} */
	#leadWith = null;
}