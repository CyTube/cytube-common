import clone from 'clone';
import redis from 'redis';
import Promise from 'bluebird';
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

export default class RedisClientProvider {
    constructor(redisConfig) {
        this.redisConfig = redisConfig;
    }

    get(options = {}) {
        const config = clone(this.redisConfig);
        for (const key in options) {
            config[key] = options[key];
        }

        const client = redis.createClient(config);
        client.on('error', this._defaultErrorHandler);

        return client;
    }

    _defaultErrorHandler(err) {
    }
}
