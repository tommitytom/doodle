export default class Modulator {
	constructor() {
		this._targets = [];
	}

	set target(target) {
		this._targets = [ target ];
	}

	get target() {
		if (this._targets.length > 0) {
			return this._targets[0];
		}

		return '';
	}

	get targets() {
		return this._targets;
	}

	addTarget(name) {
		this._targets.push(name);
	}
}