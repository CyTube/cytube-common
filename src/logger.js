import cluster from 'cluster';
import path from 'path';
import winston from 'winston';

const WORKER_ID = cluster.isMaster ? 'master' : `worker-${cluster.worker.id}`;
var INSTANCE = null;

Object.defineProperty(exports, '__esModule', {
    value: true
});

Object.defineProperty(exports, 'default', {
    get() {
        if (INSTANCE === null) {
            initializeLogger();
        }

        return INSTANCE;
    }
});

function initializeLogger() {
    INSTANCE = new winston.Logger({
        level: !!process.env.DEBUG ? 'debug' : 'info',
        transports: [
            new (winston.transports.Console)({
                colorize: true
            }),
            new (winston.transports.File)({
                filename: 'application.log',
                json: false
            })
        ]
    });

    INSTANCE.filters.push((level, msg, meta) => {
        return `(${WORKER_ID}) ${msg}`;
    });
}
