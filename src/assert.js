let assert_enabled = true;

export function disable_assert() {
	assert_enabled = false;
}
export function enable_assert() {
	assert_enabled = true;
}

/**
 * 
 * @param {boolean} predicate 
 * @param  {...any} data 
 */
export function assert(predicate, ...data) {
	if (assert_enabled) {
		console.assert(predicate(), ...data);
	}
}
