import { SparseSet } from "./sparse_set.js";


let set = new SparseSet();
let ids = [];
for (let i = 0; i < 10; ++i) {
	ids.push(set.emplace(i));
}

for (let i = 4; i < 6; ++i) {
	set.erase(i);
}

for (let x of set.each()) {
	console.log(x);
}

console.log(set, ids);