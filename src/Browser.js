import PresetEditor from './PresetEditor';

import Whitney from './Apps/Whitney';
import LineFuck from './Apps/LineFuck';
import HexTile from './Apps/HexTile';
import DotMove from './Apps/DotMove';
import GeomMirror from './Apps/GeomMirror';

import * as Util from './Util';

window.onload = function() { 
	const editor = new PresetEditor('presetEditor', 'propertyGrid', 'renderArea');
	editor.addAppType('Whitney', Whitney);
	editor.addAppType('LineFuck', LineFuck);
	editor.addAppType('HexTile', HexTile);
	editor.addAppType('DotMove', DotMove);
	editor.addAppType('GeomMirror', GeomMirror);

	if (Util.getURLParameter('hide') === 'true') {
		editor.hideSettings();
	}

	let appType = Util.getURLParameter('type');
	if (appType) {
		editor.app = appType;

		let settings = { app: {}, mod: {} };

		let props = editor.preset.schema.properties;
		for (let key in props) {
			let prop = props[key];
			let val = Util.getURLParameter('a.' + key);
			if (val !== null) {
				if (prop.type === 'number') {
					val = parseFloat(val);
				} else if (prop.type === 'boolean') {
					val = val === 'true';
				}

				settings.app[key] = val;
			}
		}

		props = editor._modSchema;
		for (let key in props) {
			let prop = props[key];
			let val = Util.getURLParameter('m.' + key);
			if (val !== null) {
				if (prop.type === 'number') {
					val = parseFloat(val);
				} else if (prop.type === 'boolean') {
					val = val === 'true';
				}

				settings.mod[key] = val;
			}
		}

		editor.loadPreset(settings);
	} else {
		editor.app = 'Whitney';
	}

	editor.run();
};