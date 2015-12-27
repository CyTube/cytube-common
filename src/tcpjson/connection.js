import JSONStream from 'JSONStream';
import * as Protocol from './protocol';
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
        this.protocol = Protocol;
        this.init();
    }

    init() {
        this.readStream = JSONStream.parse();
        this.readStream.on('data', this.emit.bind(this, 'data'));
        this.socket.pipe(this.readStream);

        SOCKET_EVENTS.forEach(event => {
            this.socket.on(event, this.emit.bind(this, event));
        });
    }

    write(data) {
        this.socket.write(JSON.stringify(data));
    }

    end(data) {
        this.socket.end(data);
    }

    destroy() {
        this.socket.destroy();
    }
}
