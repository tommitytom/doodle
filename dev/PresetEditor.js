import * as SchemaUtil from './SchemaUtil';
import * as Util from './Util';
import AppRunner from './AppRunner';
import SineModulator from './SineModulator';
import Whitney from './Whitney';
import Preset from './Preset';

let appId = 0;
const APP_SETTINGS_GROUP_NAME = 'App Settings';
const MODULATORS_GROUP_NAME = 'Modulators';
const MODULATOR_COUNT = 3;

function getKeyDetails(key) {
	let name = key.substring(0, key.length - 1);
	let idx = key.substring(key.length - 1, key.length);
	return {
		name: name,
		idx: parseInt(idx)
	};
}

export default class PresetEditor {
	constructor(containerId, propertyGridId, renderAreaId) {
		this._container = document.getElementById(containerId);
		this._renderArea = document.getElementById(renderAreaId);
		this._propertyGrid = new PropertyGrid(propertyGridId);

		this._preset = null;
		this._modGroup = null;
		this._lastUpdate = 0;

		this._propertyGrid.listen((group, elem) => {
			if (group.name === APP_SETTINGS_GROUP_NAME) {
				this._preset.setProperty(elem.name, elem.value);
			} else if (group.name === MODULATORS_GROUP_NAME) {
				this._setModulatorProperty(elem);
			}

			this._updateUrl();
		});

		window.addEventListener('keypress', (evt) => {
			if (evt.code === 'Space') {
				this._appRunner.paused = !this._appRunner.paused;
			}

			if (evt.code === 'KeyZ') {
				this._propertyGrid.visible = !this._propertyGrid.visible;
				let selectorStyle = document.getElementById('appSelector').style;

				if (this._propertyGrid.visible) {
					selectorStyle.visibility = 'visible';
				} else {
					selectorStyle.visibility = 'hidden';
				}
			}

			if (evt.code === 'KeyR') {
				this.randomize();
			}
		}, false);
	}

	set app(app) {
		this._preset = null;
		this._propertyGrid.clear();

		app.id = 'app' + appId++;
		this._renderArea.innerHTML = app.render();
		app.updateElements();

		let schema = Util.deepClone(app.schema);
		schema.properties.url = {
			type: 'string',
			readOnly: true
		};

		let settingsGroup = this._propertyGrid.addGroup(APP_SETTINGS_GROUP_NAME, schema);
		this._preset = new Preset(app, settingsGroup.schema);

		let numberProps = [''];
		for (let key in settingsGroup.schema.properties) {
			let prop = settingsGroup.schema.properties[key];
			if (prop.type === 'number') { 
				numberProps.push(key);
			}
		}

		let modSchema = {};
		for (let i = 0; i < MODULATOR_COUNT; i++) {
			this._preset.addModulator(new SineModulator());

			modSchema['freq' + i] = {
				type: 'number',
				default: 1,
				minimum: 0.0001,
				maximum: 45,
				step: 0.001,
			};

			modSchema['range' + i] = {
				type: 'number',
				default: 0.25,
				minimum: 0,
				maximum: 1,
				step: 0.001
			};

			modSchema['target' + i] = {
				type: 'string',
				enum: numberProps,
				default: 'maxDistance'
			};
		}

		this._modSchema = modSchema;

		this._modGroup = this._propertyGrid.addGroup('Modulators', {
			properties: modSchema
		});

		let urlElement = settingsGroup.getElement('url').element;
		urlElement.addEventListener('focus', evt => {
			urlElement.select();
		});

		this._updateUrl();
	}

	get preset() {
		return this._preset;
	}

	get propertyGrid() {
		return this._propertyGrid;
	}

	randomize() {
		for (let key in this.preset.schema.properties) {
			let prop = this.preset.schema.properties[key];
			if (prop.randomize !== false) {
				let value = this._randomValue(prop);
				this._preset.setProperty(key, value);
				this._propertyGrid.setValue(APP_SETTINGS_GROUP_NAME, key, value);
			}
		}

		this._updateUrl();
	}

	loadPreset(settings) {
		for (let key in settings.app) {
			let value = settings.app[key];
			this._preset.setProperty(key, value);
			this._propertyGrid.setValue(APP_SETTINGS_GROUP_NAME, key, value);
		}

		for (let key in settings.mod) {
			let desc = getKeyDetails(key);
			let value = settings.mod[key];
			this._preset.setModulatorProperty(desc.idx, desc.name, value);
			this._propertyGrid.setValue(MODULATORS_GROUP_NAME, key, value);
		}
	}

	_randomValue(prop) {
		switch(prop.type) {
			case 'number': {
				let val = Math.random() * (prop.maximum - prop.minimum) + prop.minimum;
				val -= val % prop.step;
				return val;
			}
			case 'boolean':
				return Math.random() > 0.5;
		}
	}

	run() {
		window.requestAnimationFrame(ts => { this._updateFrame(ts); });
	}

	_updateFrame(timeStamp) {
		let delta = timeStamp - this._lastUpdate;
		if (this._lastUpdate === 0) {
			delta = 0;
		}

		this._preset.update(delta);
		this._propertyGrid.setLabel(APP_SETTINGS_GROUP_NAME, 'maxRadius', this._preset._modulatedData.maxRadius);
		this._lastUpdate = timeStamp;

		window.requestAnimationFrame(ts => { this._updateFrame(ts); });
	}

	_setModulatorProperty(elem) {
		let desc = getKeyDetails(elem.name);
		if (name === 'target') {
			this._preset.setModulatorTarget(desc.idx, elem.value);
		} else {
			this._preset.setModulatorProperty(desc.idx, desc.name, elem.value);
		}
	}

	_updateUrl() {
		let url = 'http://tommitytom.co.uk/doodle?';
		url += 'type=' + document.getElementById('appSelector').value;

		for (let key in this._preset.schema.properties) {
			if (key !== 'url' && key !== 'position') {
				let value = this._preset.getProperty(key);
				url += `&a.${key}=${value}`;
			}
		}

		for (let key in this._modGroup.schema.properties) {
			let desc = getKeyDetails(key);
			if (this._preset.getModulatorProperty(desc.idx, 'target') !== '') {
				let value = this._preset.getModulatorProperty(desc.idx, desc.name);
				url += `&m.${key}=${value}`;
			}
		}

		this._propertyGrid.setValue(APP_SETTINGS_GROUP_NAME, 'url', url);
	}
}