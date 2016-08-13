import AppRunner from './AppRunner';
import * as SchemaUtil from './SchemaUtil';
import SineModulator from './SineModulator';
import Whitney from './Whitney';
import Preset from './Preset';

let appId = 0;

export default class PresetEditor {
	constructor(containerId, propertyGridId, renderAreaId) {
		this._container = document.getElementById(containerId);
		this._renderArea = document.getElementById(renderAreaId);
		this._propertyGrid = new PropertyGrid(propertyGridId);

		this._lastUpdate = 0;

		this._propertyGrid.listen((name, value) => {
			this.updateUrl();

			if (this.app && this.app.onChanged) {
				this.app.onChanged(name, value);
			}
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

		this._preset = new Preset();
		this._preset.onUpdate(changed => {
			for (let i = 0; i < changed.length; i++) {
				let name = changed[i];
				let value = this._appRunner.app.data[name];
				this._propertyGrid.setValue(name, value);
			}
		});
	}

	updateUrl() {
		let url = 'http://tommitytom.co.uk/doodle?';
		url += 'type=' + document.getElementById('appSelector').value;

		if (this._propertyGrid.schema && this._propertyGrid.state) {
			for (let key in this._propertyGrid.schema.properties) {
				if (key !== 'url') {
					let value = this._propertyGrid.state[key];
					url += `&${key}=${value}`;
				}
			}
		}

		this._propertyGrid.setValue('App Settings', 'url', url);
	}

	set app(app) {
		let id = 'app' + appId++;
		this._renderArea.innerHTML = app.createElement(id);
		app.element = document.getElementById(id);

		this._preset.clearModulations();
		this._propertyGrid.clear();

		let schema = JSON.parse(JSON.stringify(app.schema));
		schema.properties.url = {
			type: 'string',
			readOnly: true
		};

		app.data = this._propertyGrid.addGroup('App Settings', schema);

		this.updateUrl();

		if (app instanceof Whitney) {
			this._preset.addModulator(new SineModulator(0.2));
			this._preset.linkModulator(0, 'maxRadius', 0.2);
		}

		this._preset.schema = this._propertyGrid.schema['App Settings'];
		this._preset.app = app;
	}

	get preset() {
		return this._preset;
	}

	get propertyGrid() {
		return this._propertyGrid;
	}

	randomize() {
		for (let key in this._propertyGrid.schema.properties) {
			let prop = this._propertyGrid.schema.properties[key];
			if (prop.randomize !== false) {
				let value = this._randomValue(prop);
				this._propertyGrid.setValue(key, value);
			}
		}

		this.updateUrl();
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
		this._preset.render();

		this._lastUpdate = timeStamp;

		window.requestAnimationFrame(ts => { this._updateFrame(ts); });
	}
}