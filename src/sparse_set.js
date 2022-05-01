import { PAGE_SIZE, NULL, RESERVED } from "./constants.js";
import { FixedArray } from "./fixed_array.js";
import { SparseId, toVersion, toId, combine } from "./sparse_id.js";
import { assert } from "./assert.js";
import { Vector } from "./stl.js";

/**
 * @implements {ecs.SparseSetIterator}
 */
export class SparseSetIterator {
	constructor(dense) {
		this.#dense = dense;
		this.#nextIdx = this.#dense.size() - 1;
	}

	*[Symbol.iterator]() {
		let x = this.#dense.size();
		for (let i = x - 1; 0 <= i; --i) {
			yield this.#dense[i];
		}
	}

	/**
	 *
	 * @param {boolean} reset
	 * @returns {{value: number, done: boolean}}
	 */
	next(reset) {
		if (reset) {
			this.#itCount = 0;
			this.#nextIdx = this.#dense.size() - 1;
		}

		if (0 <= this.#nextIdx) {
			return { value: this.#dense[this.#nextIdx--], done: false };
		}
		else {
			return { value: this.#itCount, done: true };
		}
	}

	/** @type {std.Vector<any>} */
	#dense = null;
	/** @type {number} */
	#nextIdx = 0;
	/** @type {number} */
	#itCount = 0;
}

/**
 * @extends {ecs.SparseSet}
 */
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
		return new SparseSetIterator(this.#dense);
	}

	/**
	 *
	 * @param {number} id
	 * @param {{ push: () => void, update: (pos: number) => void }} mixin
	 * @returns {number}
	 */
	_emplace(id, mixin = { push() { }, update(_pos) { } }) {
		assert(() => !this.contains(id), `Already contains entry ${id}`);
		/** @type {SparseId | number} */
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

	/**
	 *
	 * @param {number} id
	 * @param {{ swap: (posA: number, posB: number) => void, pop: () => void }} mixin
	 */
	_erase(id, mixin = { swap(_posA, _posB) { }, pop() { } }) {
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

	/**
	 * Remove entry if present
	 * @param {number} id
	 * @returns {boolean} returns true if removed, false if it wasn't contained.
	 */
	remove(id) {
		return this.contains(id) && (this.erase(id), true);
	}

	size() {
		return this.#dense.length;
	}

	/**
	 *
	 * @param {number} id
	 * @returns {number}
	 */
	_get(id) {
		let ptr = this.#sparse_ptr(id);
		return this.#sparse[ptr.page()][ptr.pos()];
	}

	/**
	 * @protected
	 */
	get _dense() {
		return this.#dense;
	}

	/**
	 *
	 * @param {number} x
	 * @returns {number}
	 */
	#index = (x) => {
		assert(() => this.contains(x), "Set does not contain entity");
		let ptr = this.#sparse_ptr(new SparseId(x));
		return ptr.id;
	};

	/**
	 * 
	 * @param {SparseId} id 
	 * @returns {SparseId}
	 */
	#ensure_space = (id) => {
		const page = id.page();
		const pos = id.pos();

		if (!(page < this.#sparse.length)) {
			// resize the array such that has as many pages as needed.
			this.#sparse.resize(page + 1, null);
		}

		if (!this.#sparse[page]) {
			// @ts-ignore
			this.#sparse[page] = new FixedArray(PAGE_SIZE);
			this.#sparse[page].fill(NULL, 0, PAGE_SIZE);
		}

		this.#sparse[page].resize(pos);

		let elem = new SparseId(this.#sparse[page][pos] = combine(id.id, NULL));
		assert(() => elem.version == toVersion(NULL), "Slot not available");
		return elem;
	};

	/**
	 *
	 * @param {number} first
	 * @param {number} last
	 * @param {{swap: (posA: number, posB: number) => void, pop: () => void }} mixin
	 */
	#swap_pop = (first, last, mixin) => {
		if (this.#dense.size() == 0) {
			return;
		}

		for (let it = first; it != last; ++it) {
			let sparseId = new SparseId(it);
			let popped = this.#sparse[sparseId.page()][sparseId.pos()];

			let sparseIdx = this.#dense.back();
			let newBack = combine(popped, this.#dense.back());
			let backId = this.#sparse_ptr(sparseIdx);
			this.#sparse[backId.page()][backId.pos()] = newBack;

			let denseId = this.#dense[popped];
			this.#dense[popped] = this.#dense.back();
			this.#dense[this.#dense.size() - 1] = NULL;
			mixin.swap(popped, this.#dense.size() - 1);

			const id = new SparseId(denseId);
			this.#sparse[id.page()][id.pos()] = NULL;
			this.#dense.pop();
			mixin.pop();
		}
	};

	/**
	 * 
	 * @param {SparseId | number} id
	 * @returns {SparseId | null}
	 */
	#sparse_ptr = (id) => {
		if (typeof (id) === "number") {
			id = new SparseId(id);
		}
		let page = id.page();
		let pos = id.pos();
		return (page < this.#sparse.size() && this.#sparse[page][pos] !== NULL) ? new SparseId(id.toNumber()) : null;
	};

	/** @type {std.Vector<number>} */
	// @ts-ignore
	#dense = new Vector();
	/** @type {std.Vector<std.FixedArray<number>>} */
	// @ts-ignore
	#sparse = new Vector();
	/** @type {number} */
	#freeList = NULL;
}