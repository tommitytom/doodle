import CanvasApp from '../CanvasApp';

export default class Template extends CanvasApp {
	constructor() {
		super();
	}

	get schema() {
		return {};
	}

	update(delta) {
		this.fitToContainer();

		const canvas = this._canvas,
			ctx = this._context,
			data = this._data;

		
	}
}