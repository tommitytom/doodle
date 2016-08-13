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