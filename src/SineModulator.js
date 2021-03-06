import Modulator from './Modulator';

const PI2 = Math.PI * 2;

export default class SineModulator extends Modulator {
	constructor(freq = 1, range = 1) {
		super();
		
		this._freq = freq;
		this._mult = 1;
		this._range = range;
		this._mod = 1000 / freq;
		this._phase = 0;
	}

	get freq() {
		return this._freq;
	}

	set freq(value) {
		this._freq = value;
		this._updateMod();
	}

	get freqMult() {
		return this._mult;
	}

	set freqMult(v) {
		this._mult = v;
		this._updateMod();
	}

	get range() {
		return this._range;
	}

	set range(value) {
		this._range = value;
	}

	get value() {
		return Math.sin(this._phase * PI2) * this._range;
	}

	update(delta) {
		this._phase = (this._phase + delta / this._mod) % 1;
	}

	_updateMod() {
		this._mod = 1000 / (this._freq * this._mult);
	}
}