import CanvasApp from '../CanvasApp';
import SineModulator from '../SineModulator';
import RampModulator from '../RampModulator';
//import HexTileSchema from './HexTileSchema';

const PI2 = Math.PI * 2;
const DEG_TO_RAD = Math.PI / 180;

function drawPolygon(ctx, x, y, radius, sides, angle) {
	let angStep = PI2 / sides,
		angPos = angle;

	ctx.beginPath();

	for (let i = 0; i < sides; i++) {
		let sx = x + Math.sin(angPos) * radius,
			sy = y + Math.cos(angPos) * radius;

		if (i === 0) {
			ctx.moveTo(sx, sy);
		} else {
			ctx.lineTo(sx, sy);
		}

		angPos += angStep;
	}

	ctx.closePath();
	ctx.stroke();
}

export default class HexTile extends CanvasApp {
	constructor() {
		super();

		this._osc = [
			this._osc1 = new RampModulator(0.1),
			this._osc2 = new RampModulator(-0.1)
		];
	}

	get schema() {
		return {
			properties: {
				depth: {
					type: 'number',
					minimum: 1,
					maximum: 6,
					step: 1,
					default: 4
				},
				angle: {
					type: 'number',
					minimum: 0,
					maximum: PI2,
					step: 0.0001,
					default: 0
				},
				zoom: {
					type: 'number',
					minimum: 0.5,
					maximum: 5,
					step: 0.01,
					default: 1
				},
				rotSpeed: {
					type: 'number',
					minimum: 0,
					maximum: 5,
					step: 0.01,
					default: 0
				},
				sizeMod: {
					type: 'number',
					minimum: 0,
					maximum: 2,
					step: 0.0001,
					default: 0.5773
				}
			}
		};
	}

	update(delta) {
		this.fitToContainer();

		let canvas = this._canvas,
			ctx = this._context,
			data = this._data;

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
			
		ctx.strokeStyle = 'white';
		this.drawPolygonFractal(ctx, 0, 0, 100 * data.zoom, 6, data.angle, 0, data.depth);
		
		ctx.restore();

		for (let i = 0; i < this._osc.length; i++) {
			this._osc[i].update(delta);
		}
	}

	drawPolygonFractal(ctx, x, y, size, sides, angle, idx, depth) {
		if (idx === depth) {
			return;
		}

		let oscV = this._osc[idx % 2].value * PI2 * this._data.rotSpeed;
		drawPolygon(ctx, x, y, size, sides, angle + oscV);

		let dist = size * 1.155;
		let rotStep = PI2 / sides;
		let rotV = angle + PI2 / (sides * 2);
		for (let i = 0; i < sides; i++) {
			let sx = x + Math.sin(rotV) * dist,
				sy = y + Math.cos(rotV) * dist;

			this.drawPolygonFractal(ctx, sx, sy, size * this._data.sizeMod, sides, rotV, idx + 1, depth);
			rotV += rotStep;
		}
	}
}