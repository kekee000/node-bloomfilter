/**
 * @file 异步hash策略的同步版本
 * @author mengke01(kekee000@gmail.com)
 */

// hash 种子列表，这里只取10个种子
const hashSeeds = [
    5, 7, 11, 13, 31, 37, 61, 71, 89, 107
];

class SyncHashStrategy {

    /**
     * 实现的一种 hash strategy
     *
     * @constructor
     * @inner
     * @param  {Function} toHash  计算hash的函数 toHash(string):Buffer
     * @param  {number} maxNumHashFunctions 函数最大个数异步操作这里设定最大20个
     */
    constructor(toHash) {
        this.toHash = toHash;
    }

    hashOneTime(funnel) {
        // 兼容 Buffer和 Array[int32, int32] 两种写法
        // Buffer 只取前4字节和后4字节
        let offsets = [];
        let bytes = this.toHash(funnel);
        // 设置初始偏移
        // buffer
        if (bytes.byteLength) {
            for (let i = 0, l = Math.floor(bytes.byteLength / 4); i < l; i++) {
                offsets.push(bytes.readInt32BE(i));
            }
        }
        // array
        else {
            offsets.push(bytes[0]);
            offsets.push(bytes[1]);
        }
        return offsets;
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
        // 首先计算一次offsets，确定一次能产生多少hashcode
        let offsets = this.hashOneTime(funnel);
        if (!offsets.length) {
            throw new Error('offsets should not be zero');
        }
        // 计算剩余的offsets
        for (let i = 0, l = Math.ceil(numHashFunctions / offsets.length); i < l; i++) {
            let tmpOffsets = this.hashOneTime(funnel + hashSeeds[i++]);
            for (let offset of tmpOffsets) {
                offsets.push(offset);
            }
        }
        if (offsets.length > numHashFunctions) {
            offsets = offsets.slice(0, numHashFunctions);
        }
        let hasChanged = false;
        for (let offset of offsets) {
            offset = (offset > 0 ? offset : -offset) % bitSize;
            hasChanged |= bitSet.set(offset);
        }
        return hasChanged;
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
        // 首先计算一次offsets，确定一次能产生多少hashcode
        let offsets = this.hashOneTime(funnel);
        if (!offsets.length) {
            throw new Error('offsets should not be zero');
        }
        // 计算剩余的offsets
        for (let i = 0, l = Math.ceil(numHashFunctions / offsets.length); i < l; i++) {
            let tmpOffsets = this.hashOneTime(funnel + hashSeeds[i++]);
            for (let offset of tmpOffsets) {
                offsets.push(offset);
            }
        }
        if (offsets.length > numHashFunctions) {
            offsets = offsets.slice(0, numHashFunctions);
        }

        for (let offset of offsets) {
            offset = (offset > 0 ? offset : -offset) % bitSize;
            if (!bitSet.get(offset)) {
                return false;
            }
        }
        return true;
    }
}

module.exports = SyncHashStrategy;
