import fs from 'fs';
import logger from '../logger';

const CACHE = {};
const EVALSHA_CACHE = {};

export function loadLuaScript(filename) {
    if (CACHE.hasOwnProperty(filename)) {
        return CACHE[filename];
    }

    CACHE[filename] = fs.readFileSync(filename).toString('utf8');
    return CACHE[filename];
}

export function runLuaScript(redisClient, filename, args) {
    if (EVALSHA_CACHE.hasOwnProperty(filename)) {
        args.unshift(EVALSHA_CACHE[filename]);
        return redisClient.evalshaAsync.apply(redisClient, args);
    } else {
        return redisClient.scriptAsync('load', loadLuaScript(filename))
                .then(sha => {
            logger.debug(`Cached ${filename} as ${sha}`);
            EVALSHA_CACHE[filename] = sha;
            args.unshift(sha);
            return redisClient.evalshaAsync.apply(redisClient, args);
        });
    }
}
