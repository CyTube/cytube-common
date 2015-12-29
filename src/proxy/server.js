import net from 'net';
import { EventEmitter } from 'events';
import Connection from './connection';

export default class Server extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.init();
    }

    init() {
        this.server = net.createServer(this.onConnection.bind(this));
        this.server.listen(this.config.getPort(), this.config.getHost());
    }

    onConnection(socket) {
        const endpoint = socket.remoteAddress + '/' + socket.remotePort;
        const connection = new Connection(socket, endpoint);
        this.emit('connection', connection);
    }
}
