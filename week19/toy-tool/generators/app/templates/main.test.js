import '../src/main.js';
let assert = require('assert')

describe('add', function () {
    it('add(3,5) should be 8', function () {
        assert.equal(add(3,5), 8);
    })
});