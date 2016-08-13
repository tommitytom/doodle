import Modulator from './Modulator';

const PI2 = Math.PI * 2;

export default class SineModulator extends Modulator {
	constructor(freq = 1) {
		super();
		
		self._phase = 0;
		self._freq = freq;
		self._mod = 1000 / freq;
	}

	get freq() {
		return this._freq;
	}

	set freq(value) {
		this._freq = value;
		self._mod = 1000 / value;
	}

	get value() {
		return Math.sin(self._phase * PI2);
	}

	update(delta) {
		self._phase = (self._phase + delta / self._mod) % 1;
	}
}