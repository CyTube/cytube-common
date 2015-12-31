import toml from 'toml';
import fs from 'fs';

export function loadFromToml(constructor, filename) {
    const rawContents = fs.readFileSync(filename).toString('utf8');
    const configData = toml.parse(rawContents);
    return new (constructor)(configData);
}
