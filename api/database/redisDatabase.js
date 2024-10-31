const Redis = require('ioredis');

const redis = new Redis();

console.log("redis connected successfully")

module.exports = redis;
