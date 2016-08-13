export default class Preset {
	constructor() {
		this._app = null;
		this._schema = null;
		this._modulators = [];
		this._modConnections = [];
		this._listeners = [];
	}

	set app(app) {
		this._app = app;
	}

	get app() {
		return this._app;
	}

	set schema(value) {
		self._schema = value;
	}

	onUpdate(func) {
		this._listeners.push(func);
	}

	addModulator(mod) {
		this._modulators.push(mod);
		return this._modulators.length - 1;
	}

	clearModulations() {
		this._modulators = [];
		this._modConnections = [];
	}

	linkModulator(idx, name, mult) {
		this._modConnections.push({
			modulator: this._modulators[idx],
			name: name,
			mult: mult
		});
	}

	_processModulators(delta) {
		this._modulators.map(mod => {
			mod.update(delta);
		});

		this._modConnections.map(conn => {
			let prop = this._schema.properties[conn.name],
				range = prop.maximum - prop.minimum,
				val = conn.modulator.value * range * conn.mult;

			this._propertyGrid.modulateValue(conn.name, val);
		});
	}

	update(delta) {
		//this._processModulators(delta);
		this._app.render(delta);
	}

	render() {

	}
}