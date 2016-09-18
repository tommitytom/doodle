import CanvasApp from './CanvasApp';

export default class HexTile extends CanvasApp {
	constructor() {
		super();
	}

	get schema() {
		return {};
	}

	update(delta) {
		this.fitToContainer();

		let canvas = this._canvas,
			ctx = this._context;

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.translate(canvas.width * 0.5 + 0.5, canvas.height * 0.5 + 0.5);
		


		ctx.restore();
	}
}