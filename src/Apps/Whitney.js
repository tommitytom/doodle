import CanvasApp from '../CanvasApp';
import WhitneySchema from './WhitneySchema';

function rgba(r, g, b, a) {
	r = Math.floor(r);
	g = Math.floor(g);
	b = Math.floor(b);
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function getColor(ratio, alpha) {
	const pi2 = Math.PI * 2,
		v = pi2 * ratio,
		r = (0.5 + Math.cos(v) * 0.5) * 255,
		g = (0.5 + Math.cos(v + pi2 / 3.0) * 0.5) * 255,
		b = (0.5 + Math.cos(v + pi2 * 2.0 / 3.0) * 0.5) * 255;

	return rgba(r, g, b, alpha);
};

export default class Whitney extends CanvasApp {
	constructor() {
		super();

		this._phase = 0;
		this._points = [];
		this._size = 1;

		this.outputs = ['position'];
	}

	get schema() {
		return WhitneySchema;
	}

	update(delta) {
		this.fitToContainer();

		const data = this._data,
			canvas = this._canvas,
			ctx = this._context;

		if (data.reverseDraw === true) {
			for (let i = 0; i < data.pointCount; ++i) {
				this._updatePoint(i, i);
			}
		} else {
			for (let i = 0; i < data.pointCount; ++i) {
				this._updatePoint(i, data.pointCount - 1 - i);
			}
		}

		this._scale(this._points, data.pointCount);

		ctx.fillStyle = 'black';//data.backgroundColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (data.linesOverDots === true) {
			if (data.drawDots) {
				this._drawCircles(this._points, data.pointCount);
			}

			if (data.drawLines) {
				this._drawLines(this._points, data.pointCount);
			}
		} else {
			if (data.drawLines) {
				this._drawLines(this._points, data.pointCount);
			}

			if (data.drawDots) {
				this._drawCircles(this._points, data.pointCount);
			}
		}

		const speed = 1 / (data.duration * 1000);
		data.position = (data.position + speed * delta) % 1;
	}

	_updatePoint(idx, arrIdx) {
		const 
			data = this._data,
			ratio = idx / (data.pointCount - 1),
			distanceRange = data.maxDistance - data.minDistance,
			distance = (data.maxDistance - ratio * distanceRange) * data.zoom * 0.5,
			phase = data.position * Math.PI * 2 * (idx + 1) % (Math.PI * 2),
			radiusRange = data.maxRadius - data.minRadius,
			dotColour = getColor(1 - ratio, data.dotAlpha),
			lineColour = getColor(1 - ratio, data.lineAlpha);

		this._points[arrIdx] = {
			x: Math.cos(phase) * distance,
			y: Math.sin(phase) * distance,
			radius: (data.maxRadius - ratio * radiusRange) * data.zoom,
			lineWidth: data.lineWidth,
			dotColour: dotColour,
			lineColour: lineColour
		};
	}

	_scale(items, count) {
		const
			size = Math.min(this._canvas.width, this._canvas.height),
			hw = this._canvas.width / 2,
			hh = this._canvas.height / 2;

		for (let i = 0; i < count; ++i) {
			const item = items[i];
			item.x = item.x * size + hw;
			item.y = item.y * size + hh;
			item.radius *= size;
		}
	}

	_drawCircles(points, count) {
		const ctx = this._context;
		for (let i = 0; i < count; ++i) {
			const p = points[i];
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
			ctx.fillStyle = p.dotColour;
			ctx.closePath();
			ctx.fill();
		}
	}

	_drawLines(points, count) {
		const ctx = this._context;
		for (let i = 0; i < count - 1; ++i) {
			const p = points[i];
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(points[i + 1].x, points[i + 1].y);
			ctx.lineWidth = p.lineWidth;
			ctx.strokeStyle = p.lineColour;
			ctx.closePath();
			ctx.stroke();
		}
	}
}