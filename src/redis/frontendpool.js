import { runLuaScript } from './lualoader';
import logger from '../logger';
import { isSecure } from '../util/addressutil';
import PoolEntryUpdater from './poolentryupdater';

/** @module cytube-common/redis/frontendpool */

/** Non secure frontend pool key in redis */
export const FRONTEND_POOL = 'frontend-hosts';
/**
 * Secure frontend pool key in redis.  'Secure' in this context means
 * the listener is using TLS
 */
export const FRONTEND_POOL_SECURE = 'frontend-hosts-secure';

/**
 * Interface for publishing and retrieving available frontend
 * client configuration
 */
class FrontendPool {
    /**
     * Construct a new FrontendPool.
     *
     * @param {RedisClient} redisClient redis client to use
     */
    constructor(redisClient) {
        this.redisClient = redisClient;
    }

    /**
     * Retrieve a list of 0 or more frontends that can serve clients of the
     * provided channel.
     *
     * @param {string} channel channel name the client is joining
     * @return {Promise<Array>} promise resolving to an array of available
     * frontend configuration
     */
    getFrontends(channel) {
        return runLuaScript(
                this.redisClient,
                [
                    2,
                    FRONTEND_POOL_SECURE,
                    FRONTEND_POOL,
                    Math.round(Math.random() * 1000),
                    Date.now() - 10000
                ]
        ).then(result => {
            try {
                return JSON.parse(result);
            } catch (error) {
                logger.error(`Error decoding frontend pool lookup: ${error}`);
                return [];
            }
        }).catch(error => {
            logger.error(`Error retrieving frontend list: ${error}`);
            return [];
        });
    }

    /**
     * Create a PoolEntryUpdater for the given URL in the relevant frontend
     * pool(s)
     *
     * @param {string} url websocket URL
     * @param {string} id unique ID to use as the key for this entry
     * @return {object} PoolEntryUpdater for the given URL
     */
    getPoolEntryUpdater(url, id) {
        const secure = isSecure(url);
        const entry = {
            url,
            secure
        };
        const pool = secure ? FRONTEND_POOL_SECURE : FRONTEND_POOL;

        return new PoolEntryUpdater(
                this.redisClient,
                pool,
                id,
                entry
        );
    }
}

export { FrontendPool };
