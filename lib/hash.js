/**
 * @file 适用于 bloom filter 的hash算法
 * @author mengke01(kekee000@gmail.com)
 */

const crypto = require('crypto');

function sha1hash(str) {
    return crypto.createHash('sha1').update(str).digest();
}

function md5hash(str) {
    return crypto.createHash('md5').update(str).digest();
}

function baseTimes33hash(str, offset = 5381) {
    let code = offset;
    let buffer = Buffer.from(str);
    for (let i = 0, length = buffer.length; i < length; i++) {
        code = (code << 5) + code + buffer[i] & 0x7fffffff;
    }
    return code;
}

function times33hash(data) {
    let upper = baseTimes33hash(data, 5381);
    let lower = baseTimes33hash(data, 7457);
    return [upper, lower];
}

module.exports = {
    sha1hash,
    md5hash,
    times33hash
};
