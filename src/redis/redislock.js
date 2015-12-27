import { EventEmitter } from 'events';
import Promise from 'bluebird';
import path from 'path';
import lualoader from './lualoader';

const ACQUIRE_LOCK_SCRIPT = lualoader(path.resolve(__dirname, 'lua', 'acquire_lock.lua'))

export default class RedisLock extends EventEmitter {
    constructor(redisClient, lockKey, timeout) {
        super();
        if (timeout < 2) {
            throw new RangeError('Timeout must be at least 3 seconds');
        }

        this.redisClient = redisClient;
        this.lockKey = lockKey;
        this.lockValue = this.randomValue();
        this.timeout = timeout;
        this.waiting = false;
        this.relockInterval = null;
        this.redisTimeout = null;
    }

    lock() {
        if (this.waiting) {
            return Promise.reject(new Error('Another lock() call is already pending'));
        }
        this.waiting = true;

        if (this.relockInterval === null) {
            this.relockInterval = setInterval(this.lock.bind(this),
                    this.timeout - 1);
        }

        return this.redisClient.evalAsync(ACQUIRE_LOCK_SCRIPT,
                1,
                this.lockKey,
                this.lockValue,
                this.timeout).then(([changed, oldValue]) => {
            this.waiting = false;
            clearTimeout(this.redisTimeout);
            this.redisTimeout = setTimeout(this.onRedisTimeout.bind(this), this.timeout);

            if (changed) {
                this.emit('lock acquired');
                return true;
            } else if (oldValue !== this.lockValue) {
                this.emit('lock failed');
                return false;
            } else {
                // Lock maintained.
                return true;
            }
        });
    }

    unlock() {
        
    }

    onRedisTimeout() {
        clearTimeout(this.redisTimeout);
        this.redisTimeout = null;
        this.emit('timeout');
    }

    randomValue() {
        return Math.random().toString(36).slice(2);
    }
}
