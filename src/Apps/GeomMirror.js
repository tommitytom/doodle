import CanvasApp from '../CanvasApp';

const PI2 = Math.PI * 2;

function getDist(xa, ya, xb, yb) {
	const 
		xab = xa - xb,
		yab = ya - yb;

	return Math.sqrt(xab * xab + yab * yab);
}

function getSliceDist(step, len) {
	const 
		xa = len,
		ya = 0,
		xb = Math.cos(step) * len,
		yb = Math.sin(step) * len;

	return getDist(xa, ya, xb, yb);
}

function getPointCoords(points, coords, idx, step, len, offX, offY) {
	const 
		flip = idx % 2 === 1,
		off = idx * step;

	for (let i = 0; i < points.length; i += 2) {
		const 
			a = points[i],
			d = points[i + 1],
			ang = (flip ? 1 - a : a) * step + off,
			dScaled = d * len;

		coords[i] = Math.cos(ang) * dScaled + offX;
		coords[i + 1] = Math.sin(ang) * dScaled + offY;
	}
}

function getMaxPoints(p) {
	let max = 0;
	for (let i = 0; i < p.length; i++) {
		const len = p[i].length;
		if (len > max) {
			max = len;
		}
	}

	return max;
}

export default class GeomMirror extends CanvasApp {
	constructor() {
		super();

		this._lastPos = null;
		this._points = [];
	}

	get schema() {
		return {
			properties: {
				slices: {
					type: 'number',
					minimum: 4,
					maximum: 128,
					step: 2,
					default: 32
				},
				lineWidth: {
					type: 'number',
					minimum: 1,
					maximum: 4,
					step: 0.5,
					default: 1
				},
				showSlices: {
					type: 'boolean',
					default: true
				},
				showMouse: {
					type: 'boolean',
					default: true
				}
			}
		};
	}

	onMouseDown() {
		this._points.push([]);
	}

	update(delta) {
		this.fitToContainer();

		const 
			canvas = this._canvas,
			ctx = this._context,
			data = this._data,
			p = this._points,
			center = { x: canvas.width / 2, y: canvas.height / 2 },
			len = Math.min(center.x, center.y),
			step = PI2 / data.slices,
			dStep = step * 2,
			sliceDist = getSliceDist(step, len),
			mouseX = this.mousePos.x - center.x,
			mouseY = this.mousePos.y - center.y,
			mouseAngle = PI2 - (Math.atan2(mouseX, mouseY) + Math.PI),
			mouseAngleScaled = (mouseAngle % step) / step,
			mouseDistScaled = getDist(mouseX, mouseY, 0, 0) / len,
			mouseSlice = Math.floor(mouseAngle / step),
			mouseAngleFlipped = mouseSlice % 2 === 0 ? mouseAngleScaled : 1 - mouseAngleScaled,
			drawY = Math.abs(mouseY / len),
			drawX = mouseX / (sliceDist * drawY);

		if (this.mouseDown && p.length > 0) {
			const t = p[p.length - 1];
			if (t.length === 0 || (mouseAngleFlipped !== t[t.length - 2] || mouseDistScaled !== t[t.length - 1])) {
				t.push(mouseAngleFlipped, mouseDistScaled);
			}
		}

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (data.showSlices) {
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
			let angle = -Math.PI * 0.5;
			
			ctx.beginPath();
			for (let i = 0; i < data.slices; i++) {
				ctx.moveTo(center.x, center.y);
				ctx.lineTo(center.x + Math.cos(angle) * len, center.y + Math.sin(angle) * len);
				angle += step;
			}

			ctx.stroke();
		}

		if (data.showMouse) {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

			const
				mp = [ mouseAngleFlipped, mouseDistScaled ],
				pc = [ 0, 0 ];

			for (let i = 0; i < data.slices; i++) {
				getPointCoords(mp, pc, i, step, len, center.x, center.y);

				ctx.beginPath();
				ctx.arc(pc[0], pc[1], 2, 0, Math.PI * 2, false);
				ctx.fill();
			}
		}

		if (p.length > 0) {
			ctx.strokeStyle = 'white';
			ctx.fillStyle = 'white';
			ctx.lineWidth = data.lineWidth;

			const 
				coords = [],
				maxLen = getMaxPoints(p);

			for (let i = 0; i < maxLen; i++) {
				coords.push(0);
			}

			for (let i = 0; i < data.slices; i++) {
				for (let j = 0; j < p.length; j++) {
					const lp = p[j];
					getPointCoords(lp, coords, i, step, len, center.x, center.y);

					ctx.beginPath();
					ctx.moveTo(coords[0], coords[1]);

					for (let k = 2; k < lp.length; k += 2) {
						ctx.lineTo(coords[k], coords[k + 1]);
					}

					ctx.stroke();
				}
			}
		}
	}
}