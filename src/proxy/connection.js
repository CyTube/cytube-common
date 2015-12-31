import JSONStream from 'JSONStream';
import JSONProtocol from './protocol';
import logger from '../logger';
import { EventEmitter } from 'events';

const SOCKET_EVENTS = [
    'close',
    'connect',
    'drain',
    'end',
    'error',
    'lookup',
    'timeout'
]

export default class Connection extends EventEmitter {
    constructor(socket, endpoint) {
        super();
        this.socket = socket;
        this.endpoint = endpoint;
        this.protocol = new JSONProtocol();
        this.init();
    }

    init() {
        this.readStream = JSONStream.parse();
        this.readStream.on('data', this.emit.bind(this, 'data'));
        this.on('data', this.onData.bind(this));
        this.socket.pipe(this.readStream);

        SOCKET_EVENTS.forEach(event => {
            this.socket.on(event, this.emit.bind(this, event));
        });
    }

    onData(data) {
        try {
            const [event, args] = this.protocol.deserializeEvent(data);
            process.nextTick(() => {
                this.emit.apply(this, [event].concat(args));
            });
        } catch (error) {
            logger.error(`Failed to deserialize event: ${error}`);
        }
    }

    write(data) {
        return this.socket.write(JSON.stringify(data));
    }

    end(data) {
        return this.socket.end(data);
    }

    destroy() {
        return this.socket.destroy();
    }
}
