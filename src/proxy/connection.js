import JSONStream from 'JSONStream';
import JSONProtocol from './protocol';
import logger from '../logger';
import { EventEmitter } from 'events';

/** @module cytube-common/proxy/connection */

/**
 * List of event names to propagate from the internal {@link net.Socket}.
 *
 * @see {@link https://nodejs.org/api/net.html#net_class_net_socket}
 * @type Array<string>
 */
const SOCKET_EVENTS = [
    'close',
    'connect',
    'drain',
    'end',
    'error',
    'lookup',
    'timeout'
]

/**
 * Wraps a net.Socket to send and receive JSON events.
 *
 * @extends EventEmitter
 */
class Connection extends EventEmitter {
    /**
     * Create a new Connection
     *
     * @param {net.Socket} socket Internal socket to read/write
     * @param {string} endpoint String that uniquely identifies the
     * remote address of the connection.
     */
    constructor(socket, endpoint) {
        super();
        this.socket = socket;
        this.endpoint = endpoint;
        this.protocol = new JSONProtocol();
        this.init();
    }

    /**
     * Initialize the connection for reading and writing, and bind event
     * listeners.
     *
     * @private
     */
    init() {
        this.readStream = JSONStream.parse();
        this.readStream.on('data', this.emit.bind(this, 'data'));
        this.on('data', this.onData.bind(this));
        this.socket.pipe(this.readStream);

        SOCKET_EVENTS.forEach(event => {
            this.socket.on(event, this.emit.bind(this, event));
        });
    }

    /**
     * Handle incoming data over the internal socket.  Deserialize
     * the data and emit specific events based on the payload.
     *
     * @param {Object} data JSON Object containing data from the remote socket.
     * @private
     */
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

    /**
     * Write JSON data to the connection.
     *
     * @param {Object} data JSON Object to send
     * @returns {boolean} Result of {@link net.Socket#write}.
     * @see {@link https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback}
     * @public
     */
    write(data) {
        return this.socket.write(JSON.stringify(data));
    }

    /**
     * Close the connection, optionally sending final data.
     *
     * @param {Object} data Optional JSON Object to send
     * @see {@link https://nodejs.org/api/net.html#net_socket_end_data_encoding}
     */
    end(data) {
        if (data) {
            return this.socket.end(JSON.stringify(data));
        } else {
            return this.socket.end();
        }
    }

    /**
     * Destroy the underlying socket.
     *
     * @see {@link https://nodejs.org/api/net.html#net_socket_destroy}
     */
    destroy() {
        return this.socket.destroy();
    }
}

export default Connection
