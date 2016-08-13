export default class AppRunner {
	constructor(app) {
		this._app = null;
		this._paused = false;
		this._listeners = [];
	}

	set app(app) {
		this._app = app;
	}

	get app() {
		return this._app;
	}

	get paused() {
		return this._paused;
	}

	set paused(value) {
		this._paused = value;
	}

	onUpdate(func) {
		this._listeners.push(func);
	}

	update(delta) {
		if (this._app && this._app.data && this._paused === false) {
			this._app.render(delta);
			if (this._app.outputs) {
				for (let i = 0; i < this._listeners.length; i++) {
					this._listeners[i](this._app.outputs);
				}
			}
		}
	}
}