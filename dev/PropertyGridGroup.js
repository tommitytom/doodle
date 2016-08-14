import * as Util from './Util';
import PropertyElements from './PropertyGridElement';

const GROUP_HEADER_PREFIX = 'group-header-';
const GROUP_CONTENT_PREFIX = 'group-content-';

let elementId = 0;

function createElement(name, schema) {
	let id = name + elementId++;
	if (schema.type === 'number') {
		return new PropertyElements.Slider(name, id, schema);
	}

	if (schema.type === 'boolean') {
		return new PropertyElements.CheckBox(name, id, schema);
	}

	if (schema.type === 'string') {
		if (!schema.enum) {
			return new PropertyElements.TextBox(name, id, schema);
		} else {
			return new PropertyElements.OptionSelect(name, id, schema);
		}
	}

	return null;
}

export default class PropertyGridGroup {
	constructor(name, schema) {
		this._name = name;
		this._id = Util.camelize(name);
		this._schema = schema;

		this._header = null;
		this._content = null;
		this._listener = null;
		this._elements = {};

		for (let key in schema.properties) {
			let prop = schema.properties[key];
			let elem = createElement(key, prop);
			elem.onChange(value => { this.raiseChange(elem); });
			this._elements[key] = elem;
		}
	}

	get id() {
		return this._id;
	}

	get name() {
		return this._name;
	}

	get schema() {
		return this._schema;
	}

	get elements() {
		return this._elements;
	}

	collapse() {
		this._content.style.visibility = 'hidden';
	}

	expand() {
		this._content.style.visibility = 'visible';
	}

	onChange(listener) {
		this._listener = listener;
	}

	raiseChange(elem) {
		this._listener(elem);
	}

	getElement(name) {
		return this._elements[name];
	}

	updateElements() {
		this._header = document.getElementById(`${GROUP_HEADER_PREFIX}${this.id}`);
		this._content = document.getElementById(`${GROUP_CONTENT_PREFIX}${this.id}`);

		for (let key in this._elements) {
			let elem = this._elements[key];
			elem.element = document.getElementById(elem.id);
		}

		this._header.addEventListener('click', evt => {
			if (this._content.style.visibility !== 'visible') {
				this.expand();
			} else {
				this.collapse();
			}
		});
	}

	render() {
		let components = this._renderComponents(this._elements);
		return `
			<div class="groupHeader" id="${GROUP_HEADER_PREFIX}${this.id}">${this.name}</div>
			<div class="groupContent" style="overflow: auto" id="${GROUP_CONTENT_PREFIX}${this.id}">
				<table>
					${components}
				</table>
			</div>
		`;
	}

	_renderComponents(elements) {
		let code = '';
		for (let elemName in elements) {
			let elem = elements[elemName],
				elemCode = elem.render(),
				name = Util.formatName(elemName);

			code += `
			<tr>
				<td><span class="propName">${name}</span><td>
				<td>${elemCode}</td>
			</tr>
			`;
		}

		return code;
	}
}