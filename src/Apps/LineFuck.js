import CanvasApp from '../CanvasApp';
import LineFuckSchema from './LineFuckSchema';

function drawLine(ctx, sx, sy, tx, ty) {
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(tx, ty);
	ctx.stroke();
}

export default class LineFuck extends CanvasApp {
	constructor() {
		super();

		this._vertical = false;
		this._lastFlip = 0;
		this._rotation = 0;
	}

	get schema() {
		return LineFuckSchema;
	}

	update(delta) {
		this.fitToContainer();

		const 
			canvas = this._canvas,
			ctx = this._context,
			data = this._data,
			maxX = canvas.width * 2,
			maxY = canvas.height * 2,
			lineWidth = data.lineWidth > 0.25 ? data.lineWidth : 0.25,
			lineSpacing = lineWidth * 2;

		let rotDelta = null;

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.translate(canvas.width * 0.5 + 0.5, canvas.height * 0.5 + 0.5);
		ctx.rotate(this._rotation * Math.PI / 180);
		
		ctx.strokeStyle = 'black';
		ctx.lineWidth = lineWidth;
		
		if (this._vertical) {
			for (let x = -maxX; x < maxX; x += lineSpacing) {
				drawLine(ctx, x, -maxY, x, maxY);
			}
		} else {
			for (let y = -maxY; y < maxY; y += lineSpacing) {
				drawLine(ctx, -maxX, y, maxX, y);
			}
		}

		ctx.restore();

		const delay = 1000 / this._data.updateRate;

		this._lastFlip += delta;
		if (this._lastFlip > delay) {
			rotDelta = this._lastFlip;
			this._vertical = !this._vertical;
			this._lastFlip = this._lastFlip % delay;
		}

		if (this._data.smoothRotation === true) {
			rotDelta = delta;
		}

		if (rotDelta !== null) {
			let rotationStep = data.rotationSpeed  * (rotDelta / 1000);
			if (this._data.clockwise !== true) {
				rotationStep = -rotationStep;
			}

			this._rotation = (this._rotation + rotationStep) % 360;
		}
	}
}