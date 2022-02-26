/// <reference path="../types/index.d.ts" />

import { SparseSet } from "./sparse_set.js";
import { Vector } from "./stl.js";

export class SparseMapIteratorResult {
	constructor(id, value) {
		this.id = id;
		this.value = value;
	}
	/** @type {number} */
	id = 0;
	/** @type {any} */
	value = {};
}

/**
 * @implements {Ecs.SparseMapIterator}
 */
export class SparseMapIterator {
	/**
	 *
	 * @param {std.Vector<number>} dense
	 * @param {std.Vector<any>} storage
	 */
	constructor(dense, storage) {
		this.#dense = dense;
		this.#storage = storage;
		this.#nextIdx = this.#dense.size() - 1;
	}

	*[Symbol.iterator]() {
		for (let i = this.#dense.size() - 1; 0 <= i; --i) {
			yield new SparseMapIteratorResult(this.#dense[i], this.#storage[i]);
		}
	}

	/**
	 *
	 * @param {boolean} [reset=false]
	 * @returns {IteratorResult<any, number>}
	 */
	next(reset = false) {
		if (reset) {
			this.#itCount = 0;
			this.#nextIdx = this.#dense.size() - 1;
		}

		if (0 <= this.#nextIdx) {
			let i = this.#nextIdx--;
			/** @type {IteratorYieldResult<Ecs.SparseMapIteratorResult<any>, number>} */
			let result = { value: new SparseMapIteratorResult(this.#dense[i], this.#storage[i]) };
			return result;
		}
		else {
			/** @type {IteratorReturnResult<number>} */
			let result = { value: this.#itCount, done: true };

			return result;
		}
	}

	/** @type {std.Vector<number>} */
	#dense = null;
	/** @type {std.Vector<any>} */
	#storage = null;
	/** @type {number} */
	#nextIdx = 0;
	/** @type {number} */
	#itCount = 0;
}

/**
 * @extends {Ecs.SparseSet<any>}
 * @implements {Ecs.SparseMap<any>}
 */
export class SparseMap extends SparseSet {
	/**
	 *
	 * @param {new (...args: any[]) => any} ctor
	 */
	constructor(ctor = null) {
		super();
		this.type = ctor;
	}

	each() {
		return new SparseMapIterator(this._dense, this.#storage);
	}

	/**
	 * 
	 * @param {number} id id to emplace if available
	 * @param {any} data data to emplace
	 * @returns {number} id of emplaced entry
	 */
	emplace(id, data = null) {
		let storage = this.#storage;
		let handler = {
			push() { storage.push(data); },
			update(pos) { storage[pos] = data || {}; }
		};
		return super._emplace(id, handler);
	}

	/**
	* 
	* @param {number} id 
	*/
	erase(id) {
		let storage = this.#storage;
		let handler = {
			swap: (posA, posB) => {
				[storage[posA], storage[posB]] = [storage[posB], storage[posA]];
			},
			pop: () => { storage.pop(); }
		};
		super._erase(id, handler);
	}

	get(id) {
		let dense = super._get(id);
		return this.#storage[dense];
	}

	patch(id, data) {
		let dense = super._get(id);
		this.#storage[dense] = data;
	}

	/** @type {std.Vector<any>} */
	//@ts-ignore
	#storage = new Vector();
	/** @type {new (...args: any[]) => any} */
	type = null;
}