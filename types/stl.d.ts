export = std;
export as namespace std;

declare namespace std {
	class Vector<T> extends Array<T>, ArrayLike<T> {
		/**
		 * @returns {T} Last element or null
		 */
		back?(): T | null;

		capacity?(): number;

		/**
		 *
		 * @param {number} newSize
		 * @param {T} defaultValue
		 * @returns {number} New size after the resize
		 */
		resize?(newSize: number, defaultValue?: T): number;

		size?(): number;

		__size?: number;
	}

	class FixedArray<T> extends Vector<T> {
	};
}