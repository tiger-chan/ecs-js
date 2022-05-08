import test from "ava";
import { Vector } from "../src/stl.js";

const vectorEqual = test.macro((t, /** @type {Vector} */a, /** @type {number[]} */e) => {
	t.is(a.capacity(), e.length);
	for (let i = 0; i < a.capacity(); ++i) {
		t.is(a[i], e[i]);
	}
});

test("back", (t) => {
	const vector = new Vector(10);

	t.is(vector.back(), null);
	for (let i = 0; i < 10; ++i) {
		vector.push(i);
		t.is(vector.back(), i);
	}

	for (let i = 10; i > 0; --i) {
		t.is(vector.back(), i - 1);
		vector.pop();
	}
});

test("capacity", (t) => {
	for (let i = 1; i < 10; ++i) {
		const vector = new Vector(i);
		t.is(vector.capacity(), i);
		t.is(vector.size(), 0);
	}
});

test("create", (t) => {
	const vector = new Vector(2);
	const expected = [null, null];
	vectorEqual.exec(t, vector, expected);
});

test("push", (t) => {
	{
		const vector = new Vector(1);

		let expected = [null];
		vectorEqual.exec(t, vector, expected);

		vector.push(0);
		expected = [0];
		vectorEqual.exec(t, vector, expected);

		vector.push(1);
		expected = [0, 1];
		vectorEqual.exec(t, vector, expected);
	}

	{
		const vector = new Vector(2);

		let expected = [null, null];
		vectorEqual.exec(t, vector, expected);

		vector.push(0);
		expected = [0, null];
		vectorEqual.exec(t, vector, expected);

		vector.push(1);
		expected = [0, 1];
		vectorEqual.exec(t, vector, expected);
	}
});

test("pop", (t) => {
	{
		const vector = new Vector(1);

		let expected = [null];
		vectorEqual.exec(t, vector, expected);

		let popped = vector.pop();
		t.is(popped, null);

		vector.push(0);
		expected = [0];
		vectorEqual.exec(t, vector, expected);

		popped = vector.pop();
		expected = [null];
		vectorEqual.exec(t, vector, expected);
		t.is(popped, 0);
	}

	{
		const vector = new Vector(10);
		let expected = new Array(10);
		expected.fill(null);

		// for loop to fill then 2nd loop to pop the values.
		for (let i = 0; i < 10; ++i) {
			vector.push(i);
			expected[i] = i;
		}

		for (let i = 9; i >= 0; --i) {
			let actual = vector.pop();
			expected[i] = null;

			vectorEqual.exec(t, vector, expected);
			t.is(actual, i);
		}
	}
});

test("resize", (t) => {
	for (let i = 1; i < 10; ++i) {
		const vector = new Vector(i);

		t.is(vector.capacity(), i);
		t.is(vector.size(), 0);

		vector.resize(i + i);
		t.is(vector.size(), vector.capacity());
	}
});
