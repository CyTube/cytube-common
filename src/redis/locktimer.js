import { EventEmitter } from 'events';

export default class LockTimer extends EventEmitter {
    constructor(redisClient, key, timeout) {
        super();
        if (timeout <= 2) {
            throw new RangeError('Timeout must be at least 3 seconds');
        }

        this.redisClient = redisClient;
        this.key = key;
        this.timeout = timeout;
        this.hardTimeout = false;
        this.lastUpdateTime = Date.now();
        this.startTimer();
    }

    update(initial = false) {
        if (Date.now() - this.lastUpdateTime > 2000 * this.timeout) {
            this.hardTimeout = true;
            this.emit('hard timeout');
        }

        this.redisClient.multi()
                .getset(this.key, String(Date.now()))
                .expire(this.key, this.timeout)
                .execAsync()
                .then(([value, _]) => {
            if (value === null && !initial && !this.hardTimeout) {
                this.emit('soft timeout');
            }

            this.lastUpdateTime = Date.now();
            this.hardTimeout = false;
        });
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(this.update.bind(this, false),
                Math.floor((this.timeout - 1) / 2) * 1000);
        this.update(true);
    }

    reset() {
        clearInterval(this.timerInterval);
    }
}
