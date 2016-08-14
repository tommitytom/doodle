export function formatName(name) {
	return name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => { 
		return str.toUpperCase(); 
	});
}

export function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

export function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
		return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
	}).replace(/\s+/g, '');
}