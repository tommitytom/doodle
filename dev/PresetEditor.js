import AppRunner from './AppRunner';
import * as SchemaUtil from './SchemaUtil';
import SineModulator from './SineModulator';
import Whitney from './Whitney';

let appId = 0;

export default class PresetEditor {
	addModulator(mod) {
		this._modulators.push(mod);
		return this._modulators.length - 1;
	}

	constructor(containerId, propertyGridId, renderAreaId) {
		this._container = document.getElementById(containerId);
		this._renderArea = document.getElementById(renderAreaId);
		this._propertyGrid = new PropertyGrid(propertyGridId);

		this._modulators = [];
		this._modConnections = [];
		this._lastUpdate = 0;

		this._appRunner = new AppRunner();
		this._appRunner.onUpdate(changed => {
			for (let i = 0; i < changed.length; i++) {
				let name = changed[i];
				let value = this._appRunner.app.data[name];
				this._propertyGrid.setValue(name, value);
			}
		});

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

		this._propertyGrid.setValue('url', url);
	}

	clearModulations() {
		this._modulators = [];
		this._modConnections = [];
	}

	set app(app) {
		let id = 'app' + appId++;
		this._renderArea.innerHTML = app.createElement(id);
		app.element = document.getElementById(id);

		this.clearModulations();
		this._propertyGrid.clear();

		let schema = JSON.parse(JSON.stringify(app.schema));
		schema.properties.url = {
			type: 'string',
			readOnly: true
		};

		this._propertyGrid.schema = schema;
		app.data = this._propertyGrid.data;

		this._appRunner.app = app;
		this.updateUrl();

		if (app instanceof Whitney) {
			this.addModulator(new SineModulator(0.2));
			this.linkModulator(0, 'maxRadius', 0.2);
		}
	}

	get app() {
		return this._appRunner.app;
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
			let prop = this._propertyGrid.schema.properties[conn.name],
				range = prop.maximum - prop.minimum,
				val = conn.modulator.value * range * conn.mult;

			this._propertyGrid.modulateValue(conn.name, val);
		});
	}

	_updateFrame(timeStamp) {
		let delta = timeStamp - this._lastUpdate;
		if (this._lastUpdate === 0) {
			delta = 0;
		}

		this._processModulators(delta);

		this._appRunner.update(delta);
		this._lastUpdate = timeStamp;

		window.requestAnimationFrame(ts => { this._updateFrame(ts); });
	}
}