/**
 * @file 布隆过滤器 google guava 实现
 * @see
 * https://github.com/google/guava
 * bloom filter:
 * https://segmentfault.com/a/1190000012620152
 * @author mengke01(kekee000@gmail.com)
 */
/* eslint-disable babel/new-cap */
const BitSet = require('./BitSet');
const HashStrategy = require('./HashStrategy');
const AsyncHashStrategy = require('./AsyncHashStrategy');
const {md5hash, sha1hash, times33hash} = require('./hash');

class BloomFilter {

    /**
     * 布隆过滤器构造函数
     *
     * @param  {Object} options 参数选项
     * @param  {number} options.expectedInsertions 预计插入的元素总数
     * @param  {number} options.fpp 期望误判率，默认`0.0000001`
     * @param  {string|Object} options.strategy 使用的hash算法策略类，默认`md5hash`效果最好
     * 可选，sha1hash, md5hash, times33hash
     * nodejs 没有比较好的murmurhash实现版本，暂时先不提供了
     *
     * 参考样例  51字节cuid数据 expectedInsertions=100w ffp=0.0001
     *       输入时间：sha1hash(5.14s)      > md5hash(5.07s)   > times33hash(2.70s)
     *    数据碰撞比例：sha1hash(0.00006)   > md5hash(0.0001)  >> times33hash(0.008)
     *
     * @param  {Class|Object} options.bitSet 使用的BitSet位存储器，默认为使用Buffer实现的`BitSet`
     * @param  {number} options.maxNumHashFunctions 最大hash function 个数，默认100
     */
    constructor(options) {
        let {
            expectedInsertions,
            fpp,
            numBits,
            numHashFunctions
        } = BloomFilter.evaluate(options);
        this.expectedInsertions = expectedInsertions;
        this.fpp = fpp;
        this.numBits = numBits;
        this.numHashFunctions = numHashFunctions;
        this.isAsync = !!options.isAsync;

        let StrategyConstructor = this.isAsync ? AsyncHashStrategy : HashStrategy;
        if (!options.strategy || options.strategy === 'sha1hash') {
            this.strategy = new StrategyConstructor(sha1hash);
        }
        else if (options.strategy === 'md5hash') {
            this.strategy = new StrategyConstructor(md5hash);
        }
        else if (options.strategy === 'times33hash') {
            this.strategy = new StrategyConstructor(times33hash);
        }
        // 使用已有的strategy对象
        else {
            this.strategy = options.strategy;
        }

        if (!options.bitSet) {
            this.bitSet = new BitSet(this.numBits);
        }
        else if (typeof options.bitSet === 'function') {
            this.bitSet = new options.bitSet(this.numBits);
        }
        // 使用已有的bitSet，判断单条记录是否存在的时候外部初始化好传入
        else {
            this.bitSet = options.bitSet;
        }

        if (options.debug) {
            console.info('BloomFilter Options:',
                JSON.stringify({
                    expectedInsertions: this.expectedInsertions,
                    fpp: this.fpp,
                    numBits: this.numBits,
                    numHashFunctions: this.numHashFunctions,
                    strategy: options.strategy,
                    minBytes: Math.ceil(this.numBits / 8).toLocaleString(),
                    isAsync: this.isAsync
                }, null, 2)
            );
        }
    }

    /**
     * 放入一个数据值
     *
     * @param  {string} funnel 字符串类型数据
     * @return {boolean} 是否有位改变
     */
    put(funnel) {
        return this.strategy.put(funnel, this.numHashFunctions, this.bitSet);
    }

    /**
     * 一个数据值是否在容器里
     *
     * @param  {string} funnel 字符串类型数据
     * @return {boolean}
     */
    contains(funnel) {
        return this.strategy.contains(funnel, this.numHashFunctions, this.bitSet);
    }

    /**
     * 销毁实例
     */
    dispose() {
        this.strategy = this.bitSet = null;
    }

    optimalNumOfBits(n, p) {
        return Math.floor(-n * Math.log(p) / (Math.log(2) * Math.log(2)));
    }

    optimalNumOfHashFunctions(n, m) {
        // k 函数个数
        // (m / n) * log(2), but avoid truncation due to division!
        return Math.max(1, Math.round(m / n * Math.log(2)));
    }

    static evaluate({expectedInsertions = 1, fpp = 0.0000001, maxNumHashFunctions = 100}) {
        let {optimalNumOfBits, optimalNumOfHashFunctions} = BloomFilter.prototype;
        let numBits = optimalNumOfBits(expectedInsertions, fpp);
        let numHashFunctions = Math.min(
            maxNumHashFunctions,
            optimalNumOfHashFunctions(expectedInsertions, numBits)
        );
        return {
            expectedInsertions,
            fpp,
            numBits,
            numHashFunctions
        };
    }
}


module.exports = BloomFilter;
