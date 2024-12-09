import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
    
    constructor() {
        this.client = redis.createClient();
        this.client.on('error', (err) => console.log(err));  
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    isAlive() {
        return this.client.connected;
    }


    async get(key) {
        return await this.getAsync(key);
    }


    async set(key, val, duration) {
        await this.setAsync(key, val, 'EX', duration);
    }


    async del(key) {
        await this.delAsync(key)
    }
}

const redisClient = new RedisClient()
module.exports = redisClient;