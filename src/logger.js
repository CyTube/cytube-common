import cluster from 'cluster';
import path from 'path';
import winston from 'winston';

const WORKER_ID = cluster.isMaster ? 'master' : `worker-${cluster.worker.id}`;

class DefaultLogger {
    constructor() {
        this.delegate = winston;
    }

    initialize(consoleConfigOverride, fileConfigOverride, debug = false) {
        if (this.delegate !== winston) {
            this.delegate.error('Logger already initialized!');
            return;
        }

        const consoleConfig = {
            colorize: true
        };
        if (consoleConfigOverride) {
            for (const key in consoleConfigOverride) {
                consoleConfig[key] = consoleConfigOverride[key];
            }
        }

        const fileConfig = {
            filename: 'application.log',
            json: false
        };
        if (fileConfigOverride) {
            for (const key in fileConfigOverride) {
                fileConfig[key] = fileConfigOverride[key];
            }
        }

        this.delegate = new winston.Logger({
            level: debug ? 'debug' : 'info',
            transports: [
                new (winston.transports.Console)(consoleConfig),
                new (winston.transports.File)(fileConfig)
            ]
        });

        if (cluster.isWorker || Object.keys(cluster.workers).length > 0) {
            this.delegate.filters.push((level, msg, meta) => {
                return `(${WORKER_ID}) ${msg}`;
            });
        }
    }

    silly() {
        this.delegate.silly.apply(this.delegate, arguments);
    }

    debug() {
        this.delegate.debug.apply(this.delegate, arguments);
    }

    verbose() {
        this.delegate.verbose.apply(this.delegate, arguments);
    }

    info() {
        this.delegate.info.apply(this.delegate, arguments);
    }

    warn() {
        this.delegate.warn.apply(this.delegate, arguments);
    }

    error() {
        this.delegate.error.apply(this.delegate, arguments);
    }
}

module.exports = new DefaultLogger();
