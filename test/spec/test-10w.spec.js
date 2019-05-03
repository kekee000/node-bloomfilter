/**
 * @file 10w数据集bloom测试
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const bloomFilter = require('../../lib/index');

const dataNumbers = 100000;

describe('node-bloomfilter 10w dataset', function () {
    this.timeout(10000);
    it('bloomFilter sha1hash - 0.00001', function () {
        let filter = bloomFilter.create({
            expectedInsertions: dataNumbers,
            strategy: 'sha1hash',
            fpp: 0.00001
        });
        for (let i = 0; i < dataNumbers; i++) {
            filter.put(`00000000000000000000${i}`.slice(-20));
        }
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}`.slice(-20);
            assert.ok(filter.contains(line), 'should contains' + line);
        }
        let errors = 0;
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}a`.slice(-20);
            if(filter.contains(line)) {
                errors++;
            }
        }
        // console.log(errors, dataNumbers, errors / dataNumbers);
        assert.ok(errors / dataNumbers < 0.00001, 'fpp should less then  0.00001');
    });

    it('bloomFilter sha1hash - 0.0000001', function () {
        let filter = bloomFilter.create({
            expectedInsertions: dataNumbers,
            fpp: 0.0000001
        });
        for (let i = 0; i < dataNumbers; i++) {
            filter.put(`00000000000000000000${i}`.slice(-20));
        }
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}`.slice(-20);
            assert.ok(filter.contains(line), 'should contains' + line);
        }

        let errors = 0;
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}a`.slice(-20);
            if(filter.contains(line)) {
                errors++;
            }
        }
        // console.log(errors, dataNumbers, errors / dataNumbers);
        assert.ok(errors / dataNumbers < 0.0000001, 'fpp should less then  0.00001');
    });

    it('bloomFilter md5hash - 0.00001', function () {
        let filter = bloomFilter.create({
            expectedInsertions: dataNumbers,
            strategy: 'md5hash',
            fpp: 0.00001
        });
        for (let i = 0; i < dataNumbers; i++) {
            filter.put(`00000000000000000000${i}`.slice(-20));
        }
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}`.slice(-20);
            assert.ok(filter.contains(line), 'should contains' + line);
        }
    });

    it('bloomFilter md5hash - 0.0000001', function () {
        let filter = bloomFilter.create({
            expectedInsertions: dataNumbers,
            strategy: 'md5hash',
            fpp: 0.0000001
        });
        for (let i = 0; i < dataNumbers; i++) {
            filter.put(`00000000000000000000${i}`.slice(-20));
        }
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}`.slice(-20);
            assert.ok(filter.contains(line), 'should contains' + line);
        }
    });

    it('bloomFilter times33hash - 0.00001', function () {
        let filter = bloomFilter.create({
            expectedInsertions: dataNumbers,
            strategy: 'times33hash',
            fpp: 0.00001
        });
        for (let i = 0; i < dataNumbers; i++) {
            filter.put(`00000000000000000000${i}`.slice(-20));
        }
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}`.slice(-20);
            assert.ok(filter.contains(line), 'should contains' + line);
        }
    });

    it('bloomFilter times33hash - 0.0000001', function () {
        let filter = bloomFilter.create({
            expectedInsertions: dataNumbers,
            strategy: 'times33hash',
            fpp: 0.0000001
        });
        for (let i = 0; i < dataNumbers; i++) {
            filter.put(`00000000000000000000${i}`.slice(-20));
        }
        for (let i = 0; i < dataNumbers; i++) {
            let line = `00000000000000000000${i}`.slice(-20);
            assert.ok(filter.contains(line), 'should contains' + line);
        }
    });
});
