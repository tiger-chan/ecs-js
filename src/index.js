import { SparseSet } from "./sparse_set.js";


let set = new SparseSet();
let ids = [];
for (let i = 0; i < 10; ++i) {
	ids.push(set.emplace(i));
}

for (let i = 4; i < 6; ++i) {
	set.erase(i);
}

let each = [];
for (let x of set.each()) {
	each.push(x);
}
console.log("each", each);

let a = set.each();
let iter = [];
let result = a.next();
while (!result.done) {
	iter.push(result.value);
	set.erase(result.value);
	result = a.next();
}
console.log("iter", iter);

console.log(set);