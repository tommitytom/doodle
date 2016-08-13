export default {
	properties: {
		position: {
			type: 'number',
			minimum: 0,	
			maximum: 1, 
			default: 0, 
			step: 0.0001
		},
		pointCount: {
			type: 'number',
			default: 60,
			minimum: 2,
			maximum: 1000,
			step: 1
		},
		duration: { 
			type: 'number',
			default: 60,
			minimum: 0.001,
			maximum: 6000,
			step: 0.001
		},
		minRadius: { 	
			type: 'number', 
			minimum: 0, 
			maximum: 0.25, 
			default: 0.01, 
			step: 0.001 
		},
		maxRadius: {  	
			type: 'number', 
			minimum: 0, 
			maximum: 0.25, 
			default: 0.1, 
			step: 0.001 
		},
		minDistance: {  
			type: 'number', 
			minimum: 0, 
			maximum: 2, 
			default: 0.01, 
			step: 0.001 
		},
		maxDistance: {  
			type: 'number', 
			minimum: 0, 
			maximum: 2, 
			default: 0.9, 
			step: 0.001 
		},
		zoom: { 		
			type: 'number', 
			minimum: 0.5, 
			maximum: 5, 
			default: 1, 
			step: 0.001,
			randomize: false
		},
		lineWidth: {  	
			type: 'number', 
			minimum: 1,	
			maximum: 5, 
			default: 1, 
			step: 0.001
		},
		drawDots: {
			type: 'boolean', 
			default: true
		},
		drawLines: {
			type: 'boolean', 
			default: true
		},
		linesOverDots: {
			type: 'boolean', 
			default: false
		},
		reverseDraw: {
			type: 'boolean', 
			default: false
		}
	}
};

