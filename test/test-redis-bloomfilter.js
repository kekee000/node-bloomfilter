/**
 * @file 测试布隆过滤器
 * @author mengke01(kekee000@gmail.com)
 */

const client = require('./redis');
const assert = require('assert');
const bloomFilter = require('../lib/index');
const redisPrefix = 'test';
/* global before after */

let redisProvider = {
    setbitBatch(key, offsets, val) {
        let commends = offsets.map(offset => ['setbit', `${redisPrefix}${key}`, offset, val]);
        return new Promise((resolve, reject) => {
            client.batch(commends).exec((err, replies) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(replies);
            });
        });
    },
    getbitBatch(key, offsets, val) {
        let commends = offsets.map(offset => ['getbit', `${redisPrefix}${key}`, offset, val]);
        return new Promise((resolve, reject) => {
            client.batch(commends).exec((err, replies) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(replies);
            });
        });
    }
};

function sleep(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

let numbers = 10000;
let data = [];

for(let i = 0; i < numbers; i++) {
    // 模拟51 位 cuid
    let cuid = ('0000000000000000000000000000000000000000000000000000000'
        + i + '000000000' + (i % 56789) + '0000000000' + i).slice(-51);
    data.push(cuid);
}


async function main() {

    console.log('test num: ' + numbers);

    let filter = bloomFilter.createByRedis({
        expectedInsertions: numbers,
        fpp: 0.00001,
        maxNumHashFunctions: 10,
        debug: true
    }, redisProvider, 'bloomfilter-');

    console.time('putTime');
    for (let cuid of data) {
        await filter.put(cuid);
    }

    console.timeEnd('putTime');
    console.time('contains');
    for(let cuid of data) {
        let result = await filter.contains(cuid);
        assert.ok(result, 'cuid should contained:' + cuid);
    }
    console.timeEnd('contains');
    console.time('not-contains');
    let errorCount = 0;
    for(let i = 0; i < numbers; i++) {
        // 模拟51 位 cuid
        let cuid = ('0000000000000000000000000000000000000000000000000000000000299900000000000000' + i).slice(-51);
        let result = await filter.contains(cuid);
        if (result) {
            errorCount++;
        }
    }
    console.timeEnd('not-contains');
    console.log('errorCount', errorCount, 'percent', errorCount / numbers);
}
main();
