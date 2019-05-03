/**
 * @file index.spec.js
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const bloomFilter = require('../../lib/index');

describe('node-bloomfilter', function () {
    it('bloomFilter', function () {
        assert.ok(typeof bloomFilter.create === 'function');
        assert.ok(typeof bloomFilter.createByRedis === 'function');
    });
});
