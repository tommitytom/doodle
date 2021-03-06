function easeIn(val, min, max, strength) {
	val /= max;
	return (max - 1) * Math.pow(val, strength) + min;
};

class PropertyGridElement {
	constructor(name, id, schema) {
		this._name = name;
		this._id = id;
		this._schema = schema;
		this._element = null;
		this._changeFunc = null;
	}

	get name() {
		return this._name;
	}

	get id() {
		return this._id;
	}

	get schema() {
		return this._schema;
	}

	get element() {
		return this._element;
	}

	set element(value) {
		this._element = value;
		if (this.onElementSet) {
			this.onElementSet(value);
		}
	}

	set value(value) {
		this._element.value = value;
	}

	get value() {
		return this._element.value;
	}

	set labelValue(value) {

	}

	get labelValue() {
		return this._element.value;
	}

	onChange(func) {
		this._changeFunc = func;
	}

	raiseChange() {
		this._changeFunc(this.id, this.value);
	}
}

class RgbaSelector extends PropertyGridElement {
	constructor(name, id, schema) {
		super(name, id, schema);
		this._controls = null;
	}

	set value(value) {
		
	}

	get value() {
		
	}

	render() {
		return `
		<div id=${this.id}>
			<input
				type="range" 
				id="${this.id}-control" 
				class="propControl slider"
				value="${this.schema.default}"
				min="${this.schema.minimum}" 
				max="${this.schema.maximum}"
				step="${this.schema.step}"
			/>
			<input
				type="text" 
				id="${this.id}-label" 
				class="propValue" 
				value="${this.schema.default}"
			/>
		</div>
		`;
	}
}

class Slider extends PropertyGridElement {
	constructor(name, id, schema) {
		super(name, id, schema);
		this._control = null;
		this._label = null;
	}

	set value(value) {
		this._control.value = value;
	}

	get value() {
		return this._control.valueAsNumber;
	}

	set labelValue(value) {
		this._label.value = value;
	}

	get labelValue() {
		return this._label.value;
	}

	onElementSet(element) {
		let receivedInput = false,
			lastValue = null;

		this._control = element.children[0];
		this._label = element.children[1];

		this._control.addEventListener('input', evt => {
			receivedInput = true;

			let value = this._scaleValue(evt.target.value);
			if (value !== lastValue) {
				this._label.value = value;
				this.raiseChange();
				lastValue = value;
			}
		});

		this._control.addEventListener('change', evt => {
			if (!receivedInput) {
				this._label.value = this._scaleValue(evt.target.value);
				this.raiseChange();
			}
		});
	}

	_scaleValue(value) {
		if (this.schema.scale === 'log') {
			return easeIn(value, this.schema.minimum, this.schema.maximum, this.schema.scaleStrength);
		}

		return value;
	}

	render() {
		return `
		<div id=${this.id}>
			<input
				type="range" 
				id="${this.id}-control" 
				class="propControl slider"
				value="${this.schema.default}"
				min="${this.schema.minimum}" 
				max="${this.schema.maximum}"
				step="${this.schema.step}"
			/>
			<input
				type="text" 
				id="${this.id}-label" 
				class="propValue" 
				value="${this.schema.default}"
			/>
		</div>
		`;
	}
}

class CheckBox extends PropertyGridElement {
	constructor(name, id, schema) {
		super(name, id, schema);
	}

	set value(value) {
		this._element.checked = value;
	}

	get value() {
		return this._element.checked;
	}

	onElementSet(element) {
		element.addEventListener('change', evt => {
			this.raiseChange();
		});
	}

	render() {
		let code = `<input type="checkbox" id="${this.id}" `;
		if (this.schema.default === true) {
			code += 'checked ';
		}

		return code + '/>';
	}
}

class TextBox extends PropertyGridElement {
	constructor(name, id, schema) {
		super(name, id, schema);
	}

	onElementSet(element) {
		element.addEventListener('change', evt => {
			this.raiseChange();
		});
	}

	render() {
		return `
		<input
			type="text"
			id="${this.id}" 
			class="textProp"
			value="${this.schema.default}"
		/>`;
	}
}

class OptionSelect extends PropertyGridElement {
	constructor(name, id, schema) {
		super(name, id, schema);
	}

	onElementSet(element) {
		element.addEventListener('change', evt => {
			this.raiseChange();
		});
	}

	render() {
		let selectedParam = 'selected="selected "';
		let code = `<select class="dropdown" id="${this.id}">`;
		for (let i = 0; i < this.schema.enum.length; i++) {
			let isSelected = '';
			let val = this.schema.enum[i];

			if (val === this.schema.default) {
				isSelected = selectedParam;
			}

			code += `<option ${isSelected}value="${val}">${val}</option>`;
		}

		return code + '</select>';
	}
}

export default {
	Slider: Slider,
	CheckBox: CheckBox,
	TextBox: TextBox,
	OptionSelect: OptionSelect
};