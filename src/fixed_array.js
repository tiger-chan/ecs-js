/**
 * @template T
 * @implements {std.FixedArray<T>}
 */
export class FixedArray extends Array {
	constructor(arrayLength = 1) {
		super(arrayLength);

		this.fill();
		this.__capacity = arrayLength;
		Object.seal(this);
	}

	back() {
		if (0 < this.__size) {
			return this[this.__size - 1];
		}
		return null;
	}

	resize(newSize) {
		return this.__size = Math.max(Math.min(newSize, this.__capacity), 0);
	}

	capacity() {
		return this.__capacity;
	}

	size() {
		return this.__size;
	}

	push(x) {
		if (this.__size < this.length) {
			return this[this.__size++] = x, this.__size;
		}
	}

	pop() {
		if (0 < this.__size) {
			let a = this[--this.__size];
			return this[this.__size] = undefined, a;
		}
		return undefined;
	}

	__size = 0;
	__capacity = 0;
}

export default FixedArray;
