/**
 * @file 10w数据集bloom测试
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const bloomFilter = require('../../lib/index');
const client = require('../redis');

const redisPrefix = 'test';

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

const dataNumbers = 10000;

describe('node-bloomfilter redis 10w dataset', function () {
    this.timeout(10000);

    before(function (done) {
        client.del(`${redisPrefix}bloomfilter`, function () {
            done();
        });
    });

    after(function (done) {
        client.del(`${redisPrefix}bloomfilter`, function () {
            done();
        });
    });

    it('bloomFilter sha1hash - 0.00001', function (done) {
        let filter = bloomFilter.createByRedis({
            expectedInsertions: dataNumbers,
            fpp: 0.00001,
            maxNumHashFunctions: 10,
            debug: true
        }, redisProvider, 'bloomfilter');
        let processor = async function () {
            for (let i = 0; i < dataNumbers; i++) {
                await filter.put(`00000000000000000000${i}`.slice(-20));
            }
            console.log('put done');
            for (let i = 0; i < dataNumbers; i++) {
                let line = `00000000000000000000${i}`.slice(-20);
                let result = await filter.contains(line);
                assert.ok(result, 'should contains' + line);
            }
            console.log('get done');
            let errors = 0;
            for (let i = 0; i < dataNumbers; i++) {
                let line = `00000000000000000000${i}b`.slice(-20);
                let result = await filter.contains(line);
                if(result) {
                    errors++;
                }
            }
            console.log('errors done');
            console.log(errors, dataNumbers, errors / dataNumbers);
            assert.ok(errors / dataNumbers < 0.00001, 'fpp should less then  0.00001');
        };
        processor().then(function () {
            done();
        });
    });
});
