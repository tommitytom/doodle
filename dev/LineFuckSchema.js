export default {
	properties: {
		updateRate: {
			type: 'number',
			default: 20,
			minimum: 0,
			maximum: 60,
			step: 0.25
		},
		rotationSpeed: { 
			type: 'number',
			default: 0,
			minimum: 0,
			maximum: 1080
		},
		lineWidth: {
			type: 'number',
			default: 2,
			minimum: 0.25,
			maximum: 16,
			step: 0.25
		},
		clockwise: {
			type: 'boolean',
			default: true
		},
		smoothRotation: {
			type: 'boolean',
			default: false
		}
	}
};