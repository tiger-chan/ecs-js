import test from "ava";
import FixedArray from "../src/fixed_array.js";

const fixedArrayEqual = test.macro((t, /** @type {FixedArray} */a, /** @type {number[]} */e) => {
	t.is(a.capacity(), e.length);
	for (let i = 0; i < a.capacity(); ++i) {
		t.is(a[i], e[i]);
	}
});

test("back", (t) => {
	const fixed = new FixedArray(10);

	t.is(fixed.back(), null);
	for (let i = 0; i < 10; ++i) {
		fixed.push(i);
		t.is(fixed.back(), i);
	}

	for (let i = 10; i > 0; --i) {
		t.is(fixed.back(), i - 1);
		fixed.pop();
	}
});

test("capacity", (t) => {
	for (let i = 1; i < 10; ++i) {
		const fixed = new FixedArray(i);
		t.is(fixed.capacity(), i);
		t.is(fixed.size(), 0);
	}
});

test("create", (t) => {
	const fixed = new FixedArray(2);
	const expected = [undefined, undefined];
	fixedArrayEqual.exec(t, fixed, expected);
});

test("push", (t) => {
	{
		const fixed = new FixedArray(1);

		let expected = [undefined];
		fixedArrayEqual.exec(t, fixed, expected);

		fixed.push(0);
		expected = [0];
		fixedArrayEqual.exec(t, fixed, expected);

		// Pusing past the end shouldn't change the array
		fixed.push(1);
		fixedArrayEqual.exec(t, fixed, expected);
	}

	{
		const fixed = new FixedArray(2);

		let expected = [undefined, undefined];
		fixedArrayEqual.exec(t, fixed, expected);

		fixed.push(0);
		expected = [0, undefined];
		fixedArrayEqual.exec(t, fixed, expected);

		// Pusing past the end shouldn't change the array
		fixed.push(1);
		expected = [0, 1];
		fixedArrayEqual.exec(t, fixed, expected);
	}
});

test("pop", (t) => {
	{
		const fixed = new FixedArray(1);

		let expected = [undefined];
		fixedArrayEqual.exec(t, fixed, expected);

		let popped = fixed.pop();
		t.is(popped, undefined);

		fixed.push(0);
		expected = [0];
		fixedArrayEqual.exec(t, fixed, expected);

		// Pusing past the end shouldn't change the array
		popped = fixed.pop();
		expected = [undefined];
		fixedArrayEqual.exec(t, fixed, expected);
		t.is(popped, 0);
	}

	{
		const fixed = new FixedArray(10);
		let expected = new Array(10);
		expected.fill(undefined);

		// for loop to fill then 2nd loop to pop the values.
		for (let i = 0; i < 10; ++i) {
			fixed.push(i);
			expected[i] = i;
		}

		for (let i = 9; i >= 0; --i) {
			let actual = fixed.pop();
			expected[i] = undefined;

			fixedArrayEqual.exec(t, fixed, expected);
			t.is(actual, i);
		}
	}
});

test("resize", (t) => {
	for (let i = 1; i < 10; ++i) {
		const fixed = new FixedArray(i);
		
		t.is(fixed.capacity(), i);
		t.is(fixed.size(), 0);
		
		fixed.resize(i + i);
		t.is(fixed.size(), fixed.capacity());
	}
});

test("[cap + 1]", (t) => {
	t.throws(() => {
		const fixed = new FixedArray(1);
		fixed[2] = 3;
	});
});