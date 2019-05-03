/**
 * @file redis.js
 * @author mengke01(kekee000@gmail.com)
 */
const redis = require('redis');

let redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
    no_ready_check: true
});

module.exports = redisClient;
