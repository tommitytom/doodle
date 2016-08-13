import * as SchemaUtil from './SchemaUtil';

let componentRenderers = {
	number: (id, prop) => {
		return `<input 	
					type="range" 
					id="${id}-control" 
					class="propControl slider"
					value="${prop.default}"
					min="${prop.minimum}" 
					max="${prop.maximum}"
					step="${prop.step}">`;
	},
	boolean: (id, prop) => {
		let code = `<input type="checkbox" id="${id}-control" `;
		if (prop.default === true) {
			code += 'checked';
		}

		return code + '>';
	},
	string: (id, prop) => {
		return `<input
					type="text"
					id="${id}-control" 
					class="textProp"
					value="${prop.default}">`;
	}
};

function onRangeChange(r,f) {
	var n,c,m;
	r.addEventListener("input",function(e){n=1;c=e.target.value;if(c!=m)f(e);m=c;});
	r.addEventListener("change",function(e){if(!n)f(e);});
}

function getElementValue(elem, schema) {
	switch (elem.type) {
		case 'range': 
			return elem.valueAsNumber;
		case 'checkbox':
			return elem.checked;
		case 'text':
			if (schema.type === 'string') {
				return elem.value;
			} else if (schema.type === 'number') {
				return parseFloat(elem.value);
			}

			break;
	}

	return null;
}

function setControlValue(control, value) {
	switch (control.type) {
		case 'text':
		case 'range':
			control.value = value;
			break;
		case 'checkbox':
			control.checked = value;
			break;
	}
}

function setLabelValue(elem, value) {
	if (elem) {
		elem.value = value;
	}
}

function formatName(name) {
	return name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => { 
		return str.toUpperCase(); 
	});
}

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

export default class PropertyGrid {
	constructor(target) {
		if (typeof target === 'string') {
			target = document.getElementById(target);
		}

		this._target = target;
		this._listeners = [];
		this._visible = true;
		this.clear();
	}

	clear() {
		this._target.innerHTML = '';
		this._schema = null;
		this._data = null;
		this._state = null;
		this._elements = {};
		this._modulations = {};
	}

	get visible() {
		return this._visible;
	}

	set visible(value) {
		if (value) {
			this._target.style.visibility = 'visible';
		} else {
			this._target.style.visibility = 'hidden';
		}
		
		this._visible = value;
	}

	get schema() {
		return this._schema;
	}

	set schema(schema) {
		for (let key in schema.properties) {
			let prop = schema.properties[key];
			if (prop.type === 'number') {
				if (prop.default === undefined) {
					prop.default = 0;
				}

				if (prop.minimum === undefined) {
					prop.minimum = 0;
				}

				if (prop.maximum === undefined) {
					prop.maximum = 100;
				}

				if (prop.step === undefined) {
					prop.step = 1;
				}

				if (prop.overflow === undefined) {
					prop.overflow = 'clip';
				}
			} else if (prop.type === 'boolean') {
				if (prop.default === undefined) {
					prop.default = false;
				}
			} else if (prop.type === 'string') {
				if (prop.default === undefined) {
					prop.default = '';
				}
			}
		}

		this._schema = schema;

		this._state = {};
		this.setMissingDefaults();
		this._data = deepClone(this._state);

		this.update();
	}

	get data() {
		return this._data;
	}

	get state() {
		return this._state;
	}

	listen(func) {
		this._listeners.push(func);
	}

	setMissingDefaults() {
		for (let key in this._schema.properties) {
			let prop = this._schema.properties[key];
			if (prop.default !== undefined && !this._state.hasOwnProperty(key)) {
				this._state[key] = prop.default;
			}
		}
	}

	setValueLabel(name, value) {
		let elem = this._elements[name];
		setLabelValue(elem.value, value);
	}

	modulateValue(name, mod) {
		let value = this._state[name] + mod;
		value = SchemaUtil.validateValue(this._schema.properties[name], value);
		this._modulations[name] = mod;
		this._data[name] = value;
		this.setValueLabel(name, value);
	}

	applyModulation(name, value) {
		let mod = this._modulations[name];
		if (mod !== undefined) {
			value = SchemaUtil.validateValue(this._schema.properties[name], value + mod);
		}

		return value;
	}

	setValue(name, value, settings = {}) {
		if (this._data) {
			let prop = this._schema.properties[name];
			value = SchemaUtil.validateValue(prop, value);

			this._state[name] = value;
			this._data[name] = this.applyModulation(name, value);

			let elem = this._elements[name];
			if (settings.updateControl !== false) {
				setControlValue(elem.control, value);
			}

			if (settings.updateLabel !== false) {
				setLabelValue(elem.value, value);
			}

			if (settings.notifyListeners === true) {
				for (let i = 0; i < this._listeners.length; i++) {
					this._listeners[i](name, value);
				}
			}
		}
	}

	_updateProperty(key, elem, sourceElem) {
		if (this._data) {
			let value = getElementValue(sourceElem, elem.schema);
			this._state[key] = value;
			this._data[key] = this.applyModulation(key, value);

			for (let i = 0; i < this._listeners.length; i++) {
				this._listeners[i](key, value);
			}

			return value;
		}
	}

	update() {
		let code = this.drawComponents(this._schema.properties);
		this._target.innerHTML = code;

		this._elements = {};
		for (let key in this._schema.properties) {
			let elem = {
				schema: this._schema.properties[key],
				control: document.getElementById(key + '-control'),
				value: document.getElementById(key + '-value')
			};

			this._elements[key] = elem;

			if (elem.value) {
				elem.value.addEventListener('change', (evt) => { 
					let value = this._updateProperty(key, elem, evt.target);
					if (value !== null) {
						setControlValue(elem.control, value);
					}
				});
			}

			if (elem.control.type === 'range') {
				onRangeChange(elem.control, (evt) => { 
					let value = this._updateProperty(key, elem, evt.target);
					if (value !== null && elem.value) {
						setLabelValue(elem.value, value);
					}
				});
			} else {
				elem.control.addEventListener('change', (evt) => { 
					this._updateProperty(key, elem, evt.target);
				});
			}			
		}

		this.refresh();
	}

	refresh() {
		for (let key in this._schema.properties) {
			let prop = this._schema.properties[key];
			let stateValue = prop.default;
			let dataValue = stateValue;

			if (this._state && this._state.hasOwnProperty(key)) {
				stateValue = this._state[key];
				dataValue = this._data[key];
			}

			let elem = this._elements[key];
			if (elem) {
				setControlValue(elem.control, stateValue);
				setLabelValue(elem.value, dataValue);
			}
		}
	}

	drawComponents(properties) {
		let code = '<table>';
		for (let key in this._schema.properties) {
			let prop = this._schema.properties[key];
			let renderer = componentRenderers[prop.type];
			if (renderer) {
				let elem = renderer(key, prop),
					name = formatName(key);

				code += `
				<tr>
					<td><span class="propName">${name}</span><td>
					<td>${elem}</td>
					<td>`;

				if (prop.type === 'number') {
					code += `<input type="text" id="${key}-value" class="propValue" value="${prop.default}" />`;
				}

				code += '</td></tr>';
			}
		}

		return code + '</table>';
	}
}