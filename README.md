node-bloomfilter
----

布隆过滤器 google guava 的nodejs实现

# 基本用法

安装：
```
npm install @baidu/node-bloomfilter
```


## 单机判定

```
let filter = bloomFilter.create({
    expectedInsertions: 100000,
    fpp: 0.00001,
    strategy: 'sha1hash',
    debug: false
});
filter.put('test-1');
console.log(filter.contains('test-1'));
```

## redis判定

需要提供redis的provider，至少实现`setbit`和`getbit`或者`setbitBatch`和`getbitBatch`。

默认使用`redis`库，一个provider实现如下：
```
const redis = require('redis');
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    no_ready_check: true
});
const redisPrefix = 'bloomfilter-test';

let redisProvider = {

    // 单bit设置版本
    setbit(key, offset, val) {
        return client.setbit(key, offset, val);
    },
    getbit(key, offset) {
        return client.getbit(key, offset);
    },

    // batch 批量设置版本
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

```

异步调用方式
```
let filter = bloomFilter.createByRedis({
    expectedInsertions: numbers,
    fpp: 0.0001,
    strategy: 'md5hash',
    maxNumHashFunctions: 7,
    debug: true
}, redisProvider, 'bloomfilter-test');
async function test() {
    await filter.put('test-1');
    console.log(await filter.contains('test-1'));
}
test();
```

# 测试

```
npm run test
```


# 发布

```
npm run pub
```
