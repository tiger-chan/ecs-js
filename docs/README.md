# ECS JS

Simple ESM ECS implementation using sparse sets.

```javascript
import { Registry } from "./registry.js"

class Position {
	constructor(x = 0, y = x, z = x) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	x = 0;
	y = 0;
	z = 0;
}

let reg = new Registry();
let a = reg.create();
reg.emplace(a, "position", new Position(123));
reg.emplace(a, "velocity", new Position(456));
reg.emplace(a, "world_position", new Position(789));

let b = reg.create();
reg.emplace(b, "position", new Position(123));
reg.emplace(b, "world_position", new Position(789));

let c = reg.create();
reg.emplace(c, "velocity", new Position(456));
reg.emplace(c, "world_position", new Position(789));

{
	let view = reg.view("position", "velocity");

	for (let entity of view.each()) {
		console.log(entity);
	}
}

{
	let view = reg.view("position", "world_position");

	for (let entity of view.each()) {
		console.log(entity);
	}
}

{
	let view = reg.view("velocity", "world_position");

	for (let [entity, velocity, worldPos] of view.each()) {
		console.log(entity, velocity, worldPos);
	}
}

{
	let view = reg.view("world_position");

	let iter = view.each();
	let result = iter.next();
	while (!result.done) {
		let [entity, worldPos] = result.value;
		console.log(entity, worldPos);
		result = iter.next();
	}
}

console.log(reg);
```