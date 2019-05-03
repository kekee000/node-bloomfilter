/**
 * @file redis 的bitset封装
 * @author mengke01(kekee000@gmail.com)
 */

class RedisBitSet {

    constructor(bitSize, redisProvider, key = 'bloomfilter') {
        if (bitSize < 8 || bitSize > 1024 * 1024 * 512 * 8) {
            throw new Error('bitSize not validate, 8 <= bitSize <= 512m');
        }
        if (!redisProvider) {
            throw new Error('should provide redisProvider!');
        }

        if (redisProvider.set && !redisProvider.get
            || redisProvider.get && !redisProvider.set
            ) {
            throw new Error('redisProvider should have `set` and `get` methods in pairs!');
        }

        if (redisProvider.setBatch && !redisProvider.getBatch
            || redisProvider.getBatch && !redisProvider.setBatch
            ) {
            throw new Error('redisProvider should have `setBatch` and `getBatch` methods  in pairs!');
        }

        this.bitSize = bitSize;
        this.redisProvider = redisProvider;
        this.key = key;
    }

    /**
     * 获取 bitSize 位个数
     *
     * @return {number}
     */
    getBitSize() {
        return this.bitSize;
    }

    /**
     * 是否支持异步多写入
     *
     * @return {boolean}
     */
    canBatch() {
        return this.redisProvider.setbitBatch && this.redisProvider.getbitBatch;
    }

    /**
     * 设置某个bit位置1
     *
     * @param {number} offset offset偏移
     * @return {number} 是否有改变
     */
    set(offset) {
        return this.redisProvider.setbit(this.key, offset, 1).then(data => +data === 0);
    }

    setBatch(offsets) {
        return this.redisProvider.setbitBatch(this.key, offsets, 1);
    }

    /**
     * 获取某个bit位置值
     *
     * @param {number} offset offset偏移
     * @return {boolean}
     */
    get(offset) {
        return this.redisProvider.getbit(this.key, offset).then(data => +data === 1);
    }

    getBatch(offsets) {
        return this.redisProvider.getbitBatch(this.key, offsets);
    }
}

module.exports = RedisBitSet;
