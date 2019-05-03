/**
 * @file 异步的hash 策略
 * @author mengke01(kekee000@gmail.com)
 */

// hash 种子列表，这里只取10个种子
const hashSeeds = [
    5, 7, 11, 13, 31, 37, 61, 71, 89, 107
];


class AsyncHashStrategy {

    /**
     * 实现的一种 hash strategy
     *
     * @constructor
     * @inner
     * @param  {Function} toHash  计算hash的函数 toHash(string):Buffer
     * @param  {number} maxNumHashFunctions 函数最大个数异步操作这里设定最大20个
     */
    constructor(toHash, maxNumHashFunctions = 20) {
        this.toHash = toHash;
        this.maxNumHashFunctions = maxNumHashFunctions;
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
    async put(funnel, numHashFunctions, bitSet) {
        numHashFunctions = Math.min(this.maxNumHashFunctions, numHashFunctions);
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
        offsets = offsets.map(offset => (offset > 0 ? offset : -offset) % bitSize);
        // 异步写入
        if (bitSet.canBatch()) {
            return bitSet.setBatch(offsets).then(results => results.some(i => i));
        }

        let promises = offsets.map(offset => bitSet.set(offset));
        return Promise.all(promises).then(results => results.some(i => i));
    }

    /**
     * 一个数据值是否在容器里
     *
     * @param  {string} funnel 字符串类型数据
     * @param  {number} numHashFunctions hash函数个数
     * @param  {number} bitSet BitSet 实例
     * @return {boolean}
     */
    async contains(funnel, numHashFunctions, bitSet) {
        numHashFunctions = Math.min(this.maxNumHashFunctions, numHashFunctions);
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
        offsets = offsets.map(offset => (offset > 0 ? offset : -offset) % bitSize);
        // 异步读取
        if (bitSet.canBatch()) {
            return bitSet.getBatch(offsets).then(results => results.every(i => i));
        }

        let promises = offsets.map(offset => bitSet.get(offset));
        return Promise.all(promises).then(results => results.every(i => i));
    }
}

module.exports = AsyncHashStrategy;
