import App from './App';

class Painter {
	constructor(canvas, context) {
		this._canvas = canvas;
		this._ctx = context;
	}

	get canvas() {
		return this._canvas;
	}

	get ctx() {
		return this._ctx;
	}

	drawCircle(x, y, radius) {
		const ctx = this._ctx;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI* 2, false);
		ctx.fill();
	}

	clear(color) {
		if (color) {
			this._ctx.color = color;
		}

		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
	}
}

export default class CanvasApp extends App {
	constructor() {
		super();
		
		this._canvas = null;
		this._context = null;
		this._painter = null;

		this._clickPos = { x: 0, y: 0 };
		this._mousePos = { x: 0, y: 0 };
		this._mouseDown = false;
	}

	get painter() {
		return this._painter;
	}

	get clickPos() {
		return this._clickPos;
	}

	get mousePos() {
		return this._mousePos;
	}

	get mouseDown() {
		return this._mouseDown;
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
		this._painter = new Painter(this._canvas, this._context);

		this._canvas.onmousedown = e => { return this._handleMouseDown(e); };
		this._canvas.onmouseup = e => { return this._handleMouseUp(e); };
		this._canvas.onmousemove = e => { return this._handleMouseMove(e); };
	}

	_handleMouseDown(e) {
		this._mouseDown = true;
		this._mousePos = { x: e.x, y: e.y };
		this._clickPos = this._mousePos;
		this.onMouseDown();
	}

	_handleMouseUp(e) {
		this._mouseDown = false;
		this._mousePos = { x: e.x, y: e.y };
		this.onMouseUp();
	}

	_handleMouseMove(e) {
		this._mousePos = { x: e.x, y: e.y };
		this.onMouseMove();
	}

	onMouseDown() {}
	onMouseUp() {}
	onMouseMove() {}
}