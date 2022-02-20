import { PAGE_SIZE, NULL } from "./constants.js";
import { FixedArray } from "./fixed_array.js";
import { SparseId, toVersion, toId, combine } from "./sparse_id.js";
import { assert } from "./assert.js";
import { Vector } from "./stl.js";

class Iterator {
	constructor(dense) {
		this.#dense = dense;
		this.#nextIdx = this.#dense.length - 1;
	}

	*[Symbol.iterator]() {
		let x = this.#dense.length;
		for (let i = x - 1; 0 <= i; --i) {
			yield this.#dense[i];
		}
	}

	next(reset) {
		if (reset) {
			this.#itCount = 0;
			this.#nextIdx = this.#dense.length - 1;
		}

		if (0 <= this.#nextIdx) {
			return { value: this.#dense[this.#nextIdx--], done: false };
		}
		else {
			return { value: this.#itCount, done: true };
		}
	}

	/** @type {Array<any>} */
	#dense = null;
	/** @type {number} */
	#nextIdx = 0;
	/** @type {number} */
	#itCount = 0;
}

export class SparseSet {
	constructor() {
		this.#freeList = NULL;
	}

	contains(id) {
		id = new SparseId(id);
		let ptr = this.#sparse_ptr(id);
		return ptr && (ptr.version === id.version);
	}

	each() {
		return new Iterator(this.#dense);
	}

	_emplace(id, mixin = { push() { }, update(pos) { } }) {
		assert(() => !this.contains(id), `Already contains entry ${id}`);
		let elem = this.#ensure_space(new SparseId(id));

		if (this.#freeList == NULL) {
			this.#dense.push(combine(elem.toNumber(), id));
			mixin.push();
			this.#sparse[elem.page()][elem.pos()] = combine(this.#dense.length - 1, id);
			elem = id;
		}
		else {
			const pos = toId(this.#freeList);
			const dense = this.#dense[pos];
			elem = this.#dense[pos] = id;
			mixin.update(pos);
			this.#freeList = dense;
		}

		return elem;
	}

	/**
	 *
	 * @param {number} id preferred id to emplace if available
	 * @returns {number} id of emplaced entry
	 */
	emplace(id) {
		return this._emplace(id);
	}

	_erase(id, mixin = { swap(posA, posB) { }, pop() { } }) {
		const start = this.#index(id);
		this.#swap_pop(start, start + 1, mixin);
	}

	/**
	 * 
	 * @param {number} id 
	 */
	erase(id) {
		this._erase(id);
	}

	_get(id) {
		let ptr = this.#sparse_ptr(id);
		return this.#sparse[ptr.page()][ptr.pos()];
	}

	get _dense() {
		return this.#dense;
	}

	#index = (x) => {
		assert(() => this.contains(x), "Set does not contain entity")
		let ptr = this.#sparse_ptr(new SparseId(x));
		return ptr.id;
	}

	/**
	 * 
	 * @param {SparseId} id 
	 * @returns {SparseId}
	 */
	#ensure_space = (id) => {
		const page = id.page();
		const pos = id.pos();

		let len = this.#sparse.length;
		if (!(page < this.#sparse.length)) {
			// resize the array such that has as many pages as needed.
			this.#sparse.resize(page + 1, null);
		}

		if (!this.#sparse[page]) {
			this.#sparse[page] = new FixedArray(PAGE_SIZE);
			this.#sparse[page].fill(NULL, 0, PAGE_SIZE);
		}

		this.#sparse[page].resize(pos);

		let elem = new SparseId(this.#sparse[page][pos] = combine(id.id, NULL));
		assert(() => elem.version == toVersion(NULL), "Slot not available");
		return elem;
	}

	/**
	 *
	 * @param {number} first
	 * @param {number} last
	 * @param {{swap: (posA, posB) => void, pop: () => void }} mixin
	 */
	#swap_pop = (first, last, mixin) => {
		for (let it = first; it != last; ++it) {
			let back = this.#sparse_ptr(this.#dense.back());
			let popped = new SparseId(it);
			let originalDense = this.#sparse[popped.page()][popped.pos()];
			this.#sparse[back.page()][back.pos()] = combine(originalDense, back);
			const id = new SparseId(this.#dense[originalDense]);
			this.#dense[originalDense] = this.#dense.back();
			mixin.swap(originalDense, this.#dense.length - 1);
			this.#sparse[id.page()][id.pos()] = NULL;
			this.#dense.pop();
			mixin.pop();
		}
	}

	/**
	 * 
	 * @param {SparseId} id 
	 * @returns {SparseId | null}
	 */
	#sparse_ptr = (id) => {
		if (typeof (id) === "number") {
			id = new SparseId(id);
		}
		let page = id.page();
		let pos = id.pos();
		return (page < this.#sparse.length && this.#sparse[page][pos] !== NULL) ? new SparseId(id.toNumber()) : null;
	}

	/** @type {Array<number>} */
	#dense = new Vector();
	/** @type {Array<Array<number>>} */
	#sparse = new Vector();
	/** @type {number} */
	#freeList = NULL;
}