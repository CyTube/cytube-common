import logger from '../logger';

/**
 * Background task that continually re-publishes a JSON value to
 * the specified hash key in Redis with an updated timestamp.
 */
class PoolEntryUpdater {
    /**
     * Create a new PoolEntryUpdater.
     *
     * @param {RedisClient} redisClient Redis client to use for updating
     * @param {string} hash Redis hash to publish to
     * @param {string} key key to publish to within the hash
     * @param {Object} value JSON value to publish
     * @param {number} interval optional refresh interval, in seconds
     * (default = 9)
     */
     constructor(redisClient, hash, key, value, interval = 9) {
         this.redisClient = redisClient;
         this.hash = hash;
         this.key = key;
         this.value = value;
         this.interval = interval;
     }

     /**
      * Start the recurring update task.
      */
     start() {
         this.stop();
         this.updateInterval = setInterval(this.update.bind(this), this.interval);
         this.update();
     }

     /**
      * Stop the recurring update task.
      */
     stop() {
         clearInterval(this.updateInterval);
     }

     update() {
         this.value.lastUpdated = Date.now();
         this.redisClient.hsetAsync(this.hash, this.key, JSON.stringify(this.value))
                .catch(error => {
            logger.error(`PoolEntryUpdater::update() failed: ${error}`);
        });
     }
}

export default PoolEntryUpdater;
