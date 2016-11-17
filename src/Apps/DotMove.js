import CanvasApp from '../CanvasApp';

export default class DotMove extends CanvasApp {
	constructor() {
		super();

		this._dots = [];
		this._states = [ 'rowShift', 'vertShift1', 'vertShift2' ];
		this._state = 'idle';
		this._stateIdx = 0;

		this._stateTime = 0;
		this._stateCoeff = 0;
		this._stateToggle = false;
	}

	get schema() {
		return {
			properties: {
				spacing: {
					type: 'number',
					minimum: 15,
					maximum: 100,
					step: 1,
					default: 30
				},
				dotSize: {
					type: 'number',
					minimum: 1,
					maximum: 100,
					step: 1,
					default: 8
				},
				/*speed: {
					type: 'number',
					minimum: 1,
					maximum: 100,
					step: 1,
					default: 10
				},*/
				delay: {
					type: 'number',
					minimum: 1,
					maximum: 1000,
					step: 1,
					default: 160
				}
			}
		};
	}

	update(delta) {
		this.fitToContainer();

		const
			painter = this.painter,
			canvas = this._canvas,
			ctx = this._context,
			data = this._data;

		painter.clear('black');

		const dotCount = { 
			x: Math.ceil(canvas.width / data.spacing) + 2, 
			y: Math.ceil(canvas.height / data.spacing) + 2
		};
		
		ctx.fillStyle = 'white';
		for (let y = 0; y < dotCount.y; y++) {
			const 
				rowId = y % 2,
				rowOff = rowId * 2 - 1;

			let xMod = rowId * data.spacing / 2;

			if (this._state == 'rowShift') {
				xMod += this._stateCoeff * data.spacing * rowOff;
			}

			xMod -= data.spacing;

			for (let x = 0; x < dotCount.x; x++) {
				let colId = x % 2,
					colOff = colId * 2 - 1,
					xOff = xMod,
					yOff = 0;

				if (this._state === 'vertShift1') {
					if (y % 4 >= 2) {
						colId = 1 - colId;
						colOff = colId * 2 - 1;
					}

					xOff += this._stateCoeff * data.spacing * 0.5 * colOff;
					yOff += this._stateCoeff * data.spacing * colOff;
				}
				else if (this._state === 'vertShift2') {
					if (y % 4 === 0 || y % 4 === 3) {
						colId = 1 - colId;
						colOff = colId * 2 - 1;
					}

					xOff -= this._stateCoeff * data.spacing * 0.5 * colOff;
					yOff += this._stateCoeff * data.spacing * colOff;
				}

				if ((colId === 0 && !this._stateToggle) || (colId === 1 && this._stateToggle)) {
					//ctx.fillStyle = 'red';
				} else {
					//ctx.fillStyle = 'yellow';
				}

				yOff -= data.spacing;

				painter.drawCircle(x * data.spacing + xOff, y * data.spacing + yOff, data.dotSize);
			}
		}

		this._stateTime += delta;
		if (this._stateTime > data.delay) {
			this._state = this._nextState();
			this._stateTime %= data.delay;
			this._stateToggle = this._state !== 'rowShift' || this._state === 'idle';
		}

		this._stateCoeff = this._stateTime / data.delay;
	}

	_nextState() {
		if (this._state === 'idle') {
			this._stateIdx = (this._stateIdx + 1) % this._states.length;
			return this._states[this._stateIdx];
		}
		
		return 'idle';
	}
}