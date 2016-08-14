import * as SchemaUtil from './SchemaUtil';
import * as Util from './Util';
import SineModulator from './SineModulator';

export default class Preset {
	constructor(app, schema) {
		this._app = app;
		this._schema = schema;

		this._data = SchemaUtil.createState(schema);
		this._modulatedData = Util.deepClone(this._data);
		app.data = this._modulatedData;

		this._modValues = {};
		this._modulators = [];
		this._listeners = [];
	}

	get schema() {
		return this._schema;
	}

	setProperty(name, value) {
		let modValue = value;
		let mod = this._modValues[name];
		if (mod) {
			let prop = this._schema.properties[name];
			modValue = SchemaUtil.validateValue(prop, value + mod);
		}

		this._data[name] = value;
		this._modulatedData[name] = modValue;
	}

	getProperty(name) {
		return this._data[name];
	}

	setModulatorProperty(idx, name, value) {
		let mod = this._modulators[idx];

		if (name === 'target') {
			this._modValues[mod.target] = 0;
			this._modulatedData[mod.target] = this._data[mod.target];
		}

		mod[name] = value;
	}

	getModulatorProperty(idx, name) {
		let mod = this._modulators[idx];
		return mod[name];
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
		this._modValues = {};
	}

	setModulatorTarget(idx, name) {
		this._modulators[idx].target = name;
	}

	linkModulator(idx, name) {
		this._modulators[idx].addTarget(name);
	}

	update(delta) {
		this._processModulators(delta);
		this._app.update(delta);
	}

	render() {

	}

	_processModulators(delta) {
		this._modulators.map(mod => {
			mod.update(delta);

			for (let i = 0; i < mod.targets.length; i++) {
				let target = mod.targets[i],
					prop = this._schema.properties[target];

				if (prop) {
					let	range = prop.maximum - prop.minimum,
						val = mod.value * range;

					this._modValues[target] = val;

					val = SchemaUtil.validateValue(prop, this._data[target] + val);
					this._modulatedData[target] = val;
				}			
			}
		});
	}
}