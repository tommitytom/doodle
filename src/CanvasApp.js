import App from './App';

export default class CanvasApp extends App {
	constructor() {
		super();
		
		this._canvas = null;
		this._context = null;
	}

	render() {
		return `<canvas id="${this.id}"></canvas>`;
	}

	fitToContainer() {
		// Make it visually fill the positioned parent
		this._canvas.style.width = '100%';
		this._canvas.style.height = '100%';
		// ...then set the internal size to match
		this._canvas.width  = this._canvas.offsetWidth;
		this._canvas.height = this._canvas.offsetHeight;
	}

	updateElements() {
		this._canvas = document.getElementById(this.id);
		this._context = this._canvas.getContext('2d');
	}
}