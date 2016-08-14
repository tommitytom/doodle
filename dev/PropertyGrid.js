import * as SchemaUtil from './SchemaUtil';
import * as Util from './Util';
import PropertyGridGroup from './PropertyGridGroup';
import Clipboard from 'clipboard';

export default class PropertyGrid {
	constructor(target) {
		if (typeof target === 'string') {
			target = document.getElementById(target);
		}

		this._clipboard = new Clipboard('.url');
		this._target = target;
		this._listeners = [];
		this._visible = true;
		this.clear();
	}

	clear() {
		this._target.innerHTML = '';
		this._groups = {};
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

	_handleChange(group, elem) {
		for (let i = 0; i < this._listeners.length; i++) {
			this._listeners[i](group, elem);
		}
	}

	addGroup(name, schema) {
		SchemaUtil.validateSchema(schema);

		let group = new PropertyGridGroup(name, schema);
		
		this._target.innerHTML += group.render();

		group.updateElements();
		for (let key in this._groups) {
			this._groups[key].updateElements();
		}

		group.onChange(elem => { this._handleChange(group, elem); });

		this._groups[name] = group;

		return group;
	}

	getGroup(groupName) {
		return this._groups[groupName];
	}

	removeGroup(groupName) {
		delete this._groups[groupName];

		let code = '';
		for (let key in this._groups) {
			code += this._groups[key].render();
		}

		this._target.innerHTML = code;

		for (let key in this._groups) {
			this._groups[key].updateElements();
		}
	}

	setValue(groupName, name, value, settings = {}) {
		let group = this._groups[groupName];
		if (group) {
			let prop = group.schema.properties[name];
			value = SchemaUtil.validateValue(prop, value);

			let elem = group.elements[name];
			if (settings.updateControl !== false) {
				elem.value = value;
			}

			if (settings.updateLabel !== false) {
				elem.labelValue = value;
			}

			if (settings.notifyListeners === true) {
				for (let i = 0; i < this._listeners.length; i++) {
					this._listeners[i](name, value);
				}
			}
		}
	}

	getValue(groupName, name) {
		let group = this._groups[groupName];
		if (group) { 
			let elem = group.elements[name];
			if (elem) {
				return elem.value;
			}
		}
	}

	setLabel(groupName, name, value) {
		let group = this._groups[groupName];
		if (group) {
			let elem = group.elements[name];
			if (elem) {
				elem.labelValue = value;
			}
		}
	}

	listen(func) {
		this._listeners.push(func);
	}
}