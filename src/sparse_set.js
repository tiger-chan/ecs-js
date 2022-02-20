import { PAGE_SIZE, NULL } from "./constants.js";
import { FixedArray } from "./fixed_array.js";
import { SparseId, toVersion, toId, combine } from "./sparse_id.js";
import { assert } from "./assert.js"

export class SparseSet {
	constructor() {
		this.#freeList = NULL;
		let back = function () {
			if (this.length > 0) {
				return this[this.length - 1];
			}
			return null;
		};

		let resize = function (newSize, defaultValue) {
			while (newSize > this.length)
				this.push(defaultValue);
			this.length = newSize;
		}
		this.#dense.back = back.bind(this.#dense);
		this.#sparse.resize = resize.bind(this.#sparse);
	}

	contains(id) {
		id = new SparseId(id);
		let ptr = this.#sparse_ptr(id);
		return ptr && (ptr.version === id.version);
	}

	/**
	 * 
	 * @param {number} expected_id preferred id to emplace if available
	 * @returns {number} id of emplaced entry
	 */
	emplace(id) {
		assert(() => !this.contains(id), `Already contains entry ${id}`);
		let elem = this.#ensure_space(new SparseId(id));

		if (this.#freeList == NULL) {
			this.#dense.push(combine(elem.toNumber(), id));
			this.#sparse[elem.page()][elem.pos()] = combine(this.#dense.length - 1, id);
			elem = id;
		}
		else {
			const pos = toId(this.#freeList);
			const dense = this.#dense[pos];
			elem = this.#dense[pos] = id;
			this.#freeList = dense;
		}

		return elem;
	}

	/**
	 * 
	 * @param {number} id 
	 */
	erase(id) {
		const start = this.#index(id);
		this.#swap_pop(start, start + 1);
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

	#swap_pop = (first, last) => {
		for (let it = first; it != last; ++it) {
			let back = this.#sparse_ptr(this.#dense.back());
			this.#sparse[back.page()][back.pos()] = combine(first, back);
			const id = new SparseId(this.#dense[first]);
			this.#dense[first] = this.#dense.back();
			this.#sparse[id.page()][id.pos()] = NULL;
			this.#dense.pop();
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
	#dense = new Array();
	/** @type {Array<Array<number>>} */
	#sparse = new Array();
	/** @type {number} */
	#freeList = NULL;
}