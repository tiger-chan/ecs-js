import * as constants from "./constants.js";
import * as sparse_id from "./sparse_id.js";
import * as stl from "./stl.js";
import * as sparse_set  from "./sparse_set.js";
import * as sparse_map from "./sparse_map.js";
import * as view  from "./view.js";
import * as registry from "./registry.js";

export default {
	NULL: constants.NULL,
	...sparse_id,
	...stl,
	...sparse_set,
	...sparse_map,
	...view,
	...registry
};