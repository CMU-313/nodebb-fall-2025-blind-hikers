// Test file for Stryker testing
const assert = require('assert');
const { add, multiply, isEven } = require('./stryker-test');

describe('Stryker Test Functions', function() {
    it('should add two numbers', function() {
        assert.equal(add(2, 3), 5);
        assert.equal(add(0, 0), 0);
        assert.equal(add(-1, 1), 0);
    });

    it('should multiply two numbers', function() {
        assert.equal(multiply(2, 3), 6);
        assert.equal(multiply(0, 5), 0);
        assert.equal(multiply(-2, 3), -6);
    });

    it('should check if number is even', function() {
        assert.equal(isEven(2), true);
        assert.equal(isEven(3), false);
        assert.equal(isEven(0), true);
    });
});
