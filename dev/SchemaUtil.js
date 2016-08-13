export function validateValue(prop, value) {
	if (prop.type === 'number') {
		if (prop.overflow === 'clip') {
			if (value < prop.minimum) {
				value = prop.minimum;
			}

			if (value > prop.maximum) {
				value = prop.maximum;
			}
		} else if (prop.overflow === 'wrap') {

		}

		value -= value % prop.step;
	}

	return value;
}

export function validateSchema(schema) {
	for (let key in schema.properties) {
		let prop = schema.properties[key];
		if (prop.type === 'number') {
			if (prop.default === undefined) {
				prop.default = 0;
			}

			if (prop.minimum === undefined) {
				prop.minimum = 0;
			}

			if (prop.maximum === undefined) {
				prop.maximum = 100;
			}

			if (prop.step === undefined) {
				prop.step = 1;
			}

			if (prop.overflow === undefined) {
				prop.overflow = 'clip';
			}
		} else if (prop.type === 'boolean') {
			if (prop.default === undefined) {
				prop.default = false;
			}
		} else if (prop.type === 'string') {
			if (prop.default === undefined) {
				prop.default = '';
			}
		}
	}
}