'use strict';

// Simple function for Stryker testing
function add(a, b) {
	return a + b;
}

function multiply(x, y) {
	return x * y;
}

function isEven(num) {
	return num % 2 === 0;
}

module.exports = { add, multiply, isEven };
