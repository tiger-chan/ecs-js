import { SparseSet } from "./sparse_set.js";
import { NULL } from "./constants.js";
import { combine } from "./sparse_id.js";
import { Vector } from "./stl.js";

export class Iterator {
	constructor(dense, storage) {
		this.#dense = dense;
		this.#storage = storage;
		this.#nextIdx = this.#dense.length - 1;
	}

	*[Symbol.iterator]() {
		let x = this.#dense.length;
		for (let i = x - 1; 0 <= i; --i) {
			yield { id: this.#dense[i], value: this.#storage[i] };
		}
	}

	next(reset) {
		if (reset) {
			this.#itCount = 0;
			this.#nextIdx = this.#dense.length - 1;
		}

		if (0 <= this.#nextIdx) {
			let i = this.#nextIdx--;
			return { value: { id: this.#dense[i], value: this.#storage[i] }, done: false };
		}
		else {
			return { value: this.#itCount, done: true };
		}
	}

	/** @type {Array<number>} */
	#dense = null;
	/** @type {Array<any>} */
	#storage = null;
	/** @type {number} */
	#nextIdx = 0;
	/** @type {number} */
	#itCount = 0;
}

export class SparseMap extends SparseSet {
	constructor() {
		super();
	}

	each() {
		return new Iterator(this._dense, this.#storage);
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
			push() { storage.push(data) },
			update(pos) { storage[pos] = data | {} }
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

	/** @type {Array<any>} */
	#storage = new Vector();
};