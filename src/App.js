export default class App {
	constructor() {
		this._id = null;
		this._data = null;
		this._typeName = null;
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

	get typeName() {
		return this._typeName;
	}
}