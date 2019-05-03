/**
 * @file test-hash.js
 * @author mengke01(kekee000@gmail.com)
 */

const {md5hash, sha1hash, times33hash} = require('../lib/bloom-filter/hash');

let bytes = md5hash('1234');
console.log(bytes.byteLength);

bytes = sha1hash('1234');
console.log(bytes.byteLength);
