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

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function createState(schema) {
	let state = {};
	for (let key in schema.properties) {
		state[key] = schema.properties[key].default;
	}

	return state;
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
		this._schema = {};
		this._state = {};
		this._data = {};
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

	addGroup(name, schema) {
		SchemaUtil.validateSchema(schema);

		let state = createState(schema),
			data = deepClone(state);
		
		this._schema[name] = schema;
		this._state[name] = state;
		this._data[name] = data;
		this._modulations[name] = {};
		this._elements[name] = {};

		this.update();

		return data;
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

	setValueLabel(group, name, value) {
		let elem = this._elements[group][name];
		setLabelValue(elem.value, value);
	}

	modulateValue(group, name, mod) {
		let value = this._state[group][name] + mod;
		value = SchemaUtil.validateValue(this._schema[group].properties[name], value);
		
		this._modulations[group][name] = mod;
		this._data[group][name] = value;
		this.setValueLabel(group, name, value);
	}

	applyModulation(group, name, value) {
		let mod = this._modulations[group][name];
		if (mod !== undefined) {
			value = SchemaUtil.validateValue(this._schema[group].properties[name], value + mod);
		}

		return value;
	}

	setValue(group, name, value, settings = {}) {
		if (this._data) {
			let prop = this._schema[group].properties[name];
			value = SchemaUtil.validateValue(prop, value);

			this._state[group][name] = value;
			this._data[group][name] = this.applyModulation(group, name, value);

			let elem = this._elements[group][name];
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

	_updateProperty(group, name, elem, sourceElem) {
		if (this._data) {
			let value = getElementValue(sourceElem, elem.schema);
			this._state[group][name] = value;
			this._data[group][name] = this.applyModulation(group, name, value);

			for (let i = 0; i < this._listeners.length; i++) {
				this._listeners[i](name, value);
			}

			return value;
		}
	}

	update() {
		let code = '';
		for (let groupName in this._schema) {
			code += this._drawGroup(groupName, this._schema[groupName]);
		}

		this._target.innerHTML = code;

		for (let groupName in this._schema) {
			let group = this._schema[groupName];
			for (let propName in group.properties) {
				let elemPrefix = camelize(groupName) + '-' + propName;
				let elem = {
					schema: group.properties[propName],
					control: document.getElementById(elemPrefix + '-control'),
					value: document.getElementById(elemPrefix + '-value')
				};

				this._elements[groupName][propName] = elem;

				if (elem.value) {
					elem.value.addEventListener('change', (evt) => { 
						let value = this._updateProperty(groupName, propName, elem, evt.target);
						if (value !== null) {
							setControlValue(elem.control, value);
						}
					});
				}

				if (elem.control.type === 'range') {
					onRangeChange(elem.control, (evt) => { 
						let value = this._updateProperty(groupName, propName, elem, evt.target);
						if (value !== null && elem.value) {
							setLabelValue(elem.value, value);
						}
					});
				} else {
					elem.control.addEventListener('change', (evt) => { 
						this._updateProperty(groupName, propName, elem, evt.target);
					});
				}			
			}
		}

		
		

		this.refresh();
	}

	refresh() {
		for (let groupName in this._schema) {
			let group = this._schema[groupName];
			for (let propName in group.properties) {
				let prop = group.properties[propName],
					stateValue = prop.default,
					dataValue = stateValue;

				if (this._state[groupName].hasOwnProperty(propName)) {
					stateValue = this._state[groupName][propName];
					dataValue = this._data[groupName][propName];
				}

				let elem = this._elements[propName];
				if (elem) {
					setControlValue(elem.control, stateValue);
					setLabelValue(elem.value, dataValue);
				}
			}
		}
	}

	_drawGroup(name, schema) {
		let camelName = camelize(name),
			components = this._drawComponents(camelName, schema.properties);

		return `
			<div class="groupHeader" id="group-header-${camelName}">${name}</div>
			<div class="groupContent" id="group-content-${camelName}">
				${components}
			</div>
		`;
	}

	_drawComponents(groupName, properties) {
		let code = '<table>';
		for (let key in properties) {
			let prop = properties[key];
			let renderer = componentRenderers[prop.type];
			if (renderer) {
				let namePrefix = `${groupName}-${key}`,
					elem = renderer(namePrefix, prop),
					name = formatName(key);

				code += `
				<tr>
					<td><span class="propName">${name}</span><td>
					<td>${elem}</td>
					<td>
				`;

				if (prop.type === 'number') {
					code += `<input type="text" id="${namePrefix}-value" class="propValue" value="${prop.default}" />`;
				}

				code += '</td></tr>';
			}
		}

		return code + '</table>';
	}
}