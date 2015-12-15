import redis from 'redis';
import Promise from 'bluebird';
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

/** Provider for redis clients created using the <code>redis</code> module. */
export default class RedisClientProvider {
    /**
     * Create a new RedisClientProvider using the given configuration.
     *
     * @param {object} redisConfig Configuration object for the
     * <code>redis</code> module.
     */
    constructor(redisConfig) {
        this.redisConfig = redisConfig;
    }

    /**
     * Get a redis client instance, and optionally silence the
     * <code>'error'</code> event.
     *
     * @param {boolean} suppressErrors Whether to add a default
     * <code>'error'</code> event handler on the returned client.
     * Defaults to <code>false</code>.
     * @return {RedisClient} A redis client created from the
     * <code>redis</code> module.
     */
    get(suppressErrors = false) {
        const client = redis.createClient(this.redisConfig);

        if (suppressErrors) {
            client.on('error', this._defaultErrorHandler);
        }

        return client;
    }

    _defaultErrorHandler(err) {
    }
}
