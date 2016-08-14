export default class App {
	constructor() {
		this._id = null;
		this._data = null;
	}

	get id() {
		return this._id;
	}

	set id(value) {
		this._id = value;
	}

	get data() {
		return this._data;
	}

	set data(value) {
		this._data = value;
	}
}