/**
 * @file index.js
 * @author mengke01(kekee000@gmail.com)
 */

exports.BloomFilter = require('./BloomFilter');
exports.HashStrategy = require('./HashStrategy');
exports.AsyncHashStrategy = require('./AsyncHashStrategy');
exports.SyncHashStrategy = require('./SyncHashStrategy');
exports.BitSet = require('./BitSet');
exports.RedisBitSet = require('./RedisBitSet');


/**
 * 创建布隆过滤器
 *
 * @param  {Object} options 参数选项
 * @param  {number} options.expectedInsertions 预计插入的元素总数
 * @param  {number} options.fpp 期望误判率，默认`0.0000001`
 * @param  {string|Object} options.strategy 使用的hash算法策略类，默认`sha1hash`效果最好
 * 可选，sha1hash, md5hash, times33hash
 * @param  {Class|Object} options.bitSet 使用的BitSet位存储器，默认为使用Buffer实现的`BitSet`
 * @param  {number} options.maxNumHashFunctions 最大hash function 个数，默认100
 * @return {BloomFilter} BloomFilter 实例
 */
exports.create = function (options) {
    return new this.BloomFilter(options);
};

/**
 * 创建布隆过滤器，使用redis存储
 *
 * @param  {Object} options 参数选项
 * @param  {number} options.expectedInsertions 预计插入的元素总数
 * @param  {number} options.fpp 期望误判率，默认`0.0000001`
 * @param  {string|Object} options.strategy 使用的hash算法策略类，默认`sha1hash`效果最好
 * 可选，sha1hash, md5hash, times33hash
 * @param  {Class|Object} options.bitSet 使用的BitSet位存储器，默认为使用Buffer实现的`BitSet`
 * @param  {number} options.maxNumHashFunctions 最大hash function 个数，默认10
 * @param  {Object} redisProvider redis驱动，需要提供一种redis驱动方式
 * @param  {string} key 用户存储的redis key
 * @return {BloomFilter} BloomFilter 实例
 */
exports.createByRedis = function (options, redisProvider, key) {
    let evaluated = this.BloomFilter.evaluate(options);
    let bitSet = new this.RedisBitSet(evaluated.numBits, redisProvider, key);
    options.maxNumHashFunctions = options.maxNumHashFunctions || 10;
    options.bitSet = bitSet;
    options.isAsync = true;
    return new this.BloomFilter(options);
};
