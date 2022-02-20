import { SparseSet } from "./sparse_set.js";
import { SparseMap } from "./sparse_map.js";

class Position {
	constructor(x = 0) {
		this.x = x;
	}
	x = 0;
	y = 0;
	z = 0;
};

let set = new SparseMap();
let ids = [];
for (let i = 0; i < 10; ++i) {
	ids.push(set.emplace(i, new Position(i)));
}

for (let i = 4; i < 6; ++i) {
	set.erase(i);
}

let each = [];
for (let x of set.each()) {
	each.push(x);
}
console.log("each", each);

set.patch(2, new Position(5));
/** @type {Position} */
let x = set.get(2);
x.y = 32;

console.log(set.get(2));

console.log(set);