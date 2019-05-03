/**
 * @file HashStrategy.js
 * @author mengke01(kekee000@gmail.com)
 */

class HashStrategy {

    /**
     * 实现的一种 hash strategy
     *
     * @constructor
     * @inner
     * @param  {Function} toHash  计算hash的函数 toHash(string):Buffer
     */
    constructor(toHash) {
        this.toHash = toHash;
    }

    /**
     * 放入一个数据值
     *
     * @param  {string} funnel 字符串类型数据
     * @param  {number} numHashFunctions hash函数个数
     * @param  {number} bitSet BitSet 实例
     * @return {boolean} 是否有位改变
     */
    put(funnel, numHashFunctions, bitSet) {
        let bitSize = bitSet.getBitSize();
        // 兼容 Buffer和 Array[int32, int32] 两种写法
        // Buffer 只取前4字节和后4字节
        let bytes = this.toHash(funnel);
        let hash1 = bytes.byteLength ? bytes.readInt32BE(0) : bytes[0];
        let hash2 = bytes.byteLength ? bytes.readInt32BE(bytes.byteLength - 4) : bytes[1];
        let bitsChanged = false;
        let combinedHash = hash1;
        for (let i = 0; i < numHashFunctions; i++) {
            // Make the combined hash positive and indexable
            // console.log(combinedHash, bitSize, combinedHash % bitSize)
            bitsChanged |= bitSet.set((combinedHash > 0 ? combinedHash : -combinedHash) % bitSize);
            combinedHash += hash2;
        }
        return bitsChanged;
    }

    /**
     * 一个数据值是否在容器里
     *
     * @param  {string} funnel 字符串类型数据
     * @param  {number} numHashFunctions hash函数个数
     * @param  {number} bitSet BitSet 实例
     * @return {boolean}
     */
    contains(funnel, numHashFunctions, bitSet) {
        let bitSize = bitSet.getBitSize();
        let bytes = this.toHash(funnel);
        let hash1 = bytes.byteLength ? bytes.readInt32BE(0) : bytes[0];
        let hash2 = bytes.byteLength ? bytes.readInt32BE(bytes.byteLength - 4) : bytes[1];
        let combinedHash = hash1;
        for (let i = 0; i < numHashFunctions; i++) {
            // Make the combined hash positive and indexable
            if (!bitSet.get((combinedHash > 0 ? combinedHash : -combinedHash) % bitSize)) {
                return false;
            }
            combinedHash += hash2;
        }
        return true;
    }
}

module.exports = HashStrategy;
