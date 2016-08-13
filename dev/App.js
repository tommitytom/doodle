export default class App {
	constructor() {
		this._data = null;
	}

	get data() {
		return this._data;
	}

	set data(value) {
		this._data = value;
	}
}