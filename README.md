# ECS JS

Simple ESM ECS implementation using sparse sets.

![GitHub](https://img.shields.io/github/license/tiger-chan/ecs-js)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/tiger-chan/ecs-js)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/tiger-chan/ecs-js/main)

## Prerequisites

This project requires NodeJS (version 14 or later) and NPM. [Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.

To make sure you have them available on your machine, try running the following command.

```sh
node -v && npm -v
```

If installed will output something like
```
v17.5.0
8.4.1
```

## Getting Started

### Installation

You can manually pull the source by cloning the repository, and use it directly in to your project

```sh
git clone https://github.com/tiger-chan/ecs-js.git
cd ecs-js
```

To install as a library you can run the following in your project

```sh
npm install @tiger-chan/ecs-js
```

Or with Yarn

```sh
yarn add @tiger-chan/ecs-js
```

## Usage

You can start using the package by importing the library JS files

```javascript
import ecs from "@tiger-chan/ecs-js";

class Position {
	constructor(x = 0, y = x, z = x) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

let reg = new ecs.Registry();
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

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/tiger-chan/ecs-js/tags).

## Authors

* **Anthony Young** - *Initial work* - [tiger-chan](https://github.com/tiger-chan)

See also the list of [contributors](https://github.com/tiger-chan/ecs-js/contributors) who participated in this project.

## License

[MIT License](LICENSE) © Anthony Young
