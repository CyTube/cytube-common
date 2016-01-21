import net from 'net';
import { EventEmitter } from 'events';
import Connection from './connection';

/**
 * Backend server that listens for proxy connections.
 *
 * @emits connection
 * @extends EventEmitter
 */
class Server extends EventEmitter {
    /**
     * Create a new Server
     *
     * @param {Object} config server configuration
     * @param {Object} protocol protocol to use for incoming connections
     */
    constructor(config, protocol) {
        super();
        this.config = config;
        this.protocol = protocol;
        this.init();
    }

    /**
     * Initialize the server
     *
     * @private
     */
    init() {
        this.server = net.createServer(this.onConnection.bind(this));
        this.server.listen(this.config.getPort(), this.config.getHost());
    }

    /**
     * Handle a new incoming proxy connection.
     *
     * @param {net.Socket} socket remote socket
     * @private
     */
    onConnection(socket) {
        const endpoint = socket.remoteAddress + '/' + socket.remotePort;
        const connection = new Connection(socket, endpoint, this.protocol);
        this.emit('connection', connection);
    }
}

export default Server
