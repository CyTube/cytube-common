import fs from 'fs';

const CACHE = {};

export default function loadLuaScript(filename) {
    if (CACHE.hasOwnProperty(filename)) {
        return CACHE[filename];
    }

    CACHE[filename] = fs.readFileSync(filename).toString('utf8');
    return CACHE[filename];
}
