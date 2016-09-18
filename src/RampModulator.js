import Modulator from './Modulator';

const PI2 = Math.PI * 2;

export default class RampModulator extends Modulator {
	constructor(freq = 1, range = 1) {
		super();
		
		this._freq = freq;
		this._range = range;
		this._mod = 1000 / freq;
		this._phase = 0;
	}

	get freq() {
		return this._freq;
	}

	set freq(value) {
		this._freq = value;
		this._mod = 1000 / value;
	}

	get range() {
		return this._range;
	}

	set range(value) {
		this._range = value;
	}

	get value() {
		return this._phase * this._range;
	}

	update(delta) {
		this._phase = (this._phase + delta / this._mod) % 1;
	}
}