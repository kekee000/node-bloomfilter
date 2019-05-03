/**
 * @file BitSet的一个内存实现
 * @author mengke01(kekee000@gmail.com)
 */


class BitSet {

    /**
     * BitSet的一个实现，这里限制最大使用内存为512m，如果需要更大内存占用，需要重写`BitSet`类
     *
     * @constructor
     * @param  {number} bitSize bit size
     * @param  {Buffer=} buffer 预先载入的buffer数据
     */
    constructor(bitSize, buffer = null) {
        if (bitSize < 8 || bitSize > 1024 * 1024 * 512 * 8) {
            throw new Error('bitSize not validate, 8 <= bitSize <= 512m');
        }
        this.bitSize = bitSize;
        if (buffer) {
            this.buffer = buffer;
        }
        else {
            this.buffer = Buffer.alloc(Math.ceil(bitSize / 8), 0);
        }
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
     * 设置某个bit位置1
     *
     * @param {number} offset offset偏移
     * @return {number} 是否有改变
     */
    set(offset) {
        let index = Math.floor(offset / 8);
        let byte = this.buffer.readUInt8(index);
        let isEmpty = !(byte & (1 << (offset % 8)));
        if (isEmpty) {
            // 设置值
            this.buffer.writeUInt8(byte | (1 << (offset % 8)), index);
        }
        return isEmpty;
    }

    /**
     * 获取某个bit位置值
     *
     * @param {number} offset offset偏移
     * @return {boolean}
     */
    get(offset) {
        let index = Math.floor(offset / 8);
        let byte = this.buffer.readUInt8(index);
        return !!(byte & (1 << (offset % 8)));
    }

    /**
     * 从外部加载Buffer对象到BitSet
     *
     * @param {Buffer} buffer buffer对象
     * @return {this}
     */
    loadBuffer(buffer) {
        let bufSize = Math.ceil(this.bitSize / 8);
        if (buffer.byteLength < bufSize) {
            throw new Error(`buffer size error should at least ${bufSize} bytes`);
        }
        this.buffer = buffer;
        return this;
    }
}
module.exports = BitSet;
