/**
 * @file 测试布隆过滤器
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const bloomFilter = require('../lib/index');
let numbers = 100000;
let data = [];

for(let i = 0; i < numbers; i++) {
    // 模拟51 位 cuid
    let cuid = ('0000000000000000000000000000000000000000000000000000000'
        + i + '000000000' + (i % 56789) + '0000000000' + i).slice(-51);
    data.push(cuid);
}


console.log('test num: ' + numbers);

let filter = bloomFilter.create({
    expectedInsertions: numbers,
    fpp: 0.0001,
    strategy: 'md5hash',
    debug: true
});

console.time('putTime');
for (let cuid of data) {
    filter.put(cuid);
}
console.timeEnd('putTime');

console.time('contains');
for(let cuid of data) {
    if (!filter.contains(cuid)) {
        assert.ok(false, 'cuid should contained:' + cuid);
    }
}
console.timeEnd('contains');

console.time('not-contains');
let errorCount = 0;
for(let i = 0; i < numbers; i++) {
    // 模拟51 位 cuid
    let cuid = ('0000000000000000000000000000000000000000000000000000000000299900000000000000' + i).slice(-51);
    if (filter.contains(cuid)) {
        errorCount++;
    }
}
console.timeEnd('not-contains');
console.log('errorCount', errorCount, 'percent', errorCount / numbers);
