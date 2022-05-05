import test from "ava";
import jsdyn from "../src/index.js";

test("create()", (t) => {
	const reg = new jsdyn.Registry();

	for (let i = 0; i < 10; ++i) {
		const entity = reg.create();
		t.is(entity, i);
		t.true(reg.valid(entity));
	}
});

test("destroy()", (t) => {
	const reg = new jsdyn.Registry();

	for (let i = 0; i < 10; ++i) {
		const entity = reg.create();
		const preDestroy = reg.valid(entity);
		reg.destroy(entity);
		t.not(reg.valid(entity), preDestroy);
	}
});

test("emplace(comp)", (t) => {
	class Foo {
	};

	{
		const reg = new jsdyn.Registry();

		const entity = reg.create();

		t.false(reg.all_of(entity, "test"));

		reg.emplace(entity, "test", new Foo());

		t.true(reg.all_of(entity, "test"));
	}

});

test("get(comp)", (t) => {
	class Foo {
	};

	{
		const reg = new jsdyn.Registry();

		const entity = reg.create();

		let foo = new Foo();
		reg.emplace(entity, "test", foo);

		let actual = reg.get(entity, "test");
		t.is(foo, actual);
	}

});

test("remove(comp)", (t) => {
	class Foo {
	};

	{
		const reg = new jsdyn.Registry();

		const entity = reg.create();

		let foo = new Foo();
		reg.emplace(entity, "test", foo);

		t.true(reg.all_of(entity, "test"));

		reg.remove(entity, "test");

		t.false(reg.all_of(entity, "test"));
	}

});

test("valid(comp)", (t) => {
	{
		const reg = new jsdyn.Registry();

		const entity = reg.create();

		t.true(reg.valid(entity));
		reg.destroy(entity);
		t.false(reg.valid(entity));
	}
});
