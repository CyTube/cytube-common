import { EventEmitter } from 'events';
import logger from '../logger';
import Connection from './connection';
import net from 'net';

/**
 * Holds {@link Connection} objects and vends them to callers.  Ensures
 * that no duplicate connections are opened to the same endpoint.
 *
 * @extends EventEmitter
 */
class ConnectionManager extends EventEmitter {
    /**
     * Create a new ConnectionManager.
     */
    constructor() {
        super();
        this.connections = {};
    }

    /**
     * Get a Connection to the specified address.  If one is not already
     * available, open a new connection.
     *
     * @param {string} address Remote address, using the format
     * <code>{hostname}/{port}</code>
     * @return {Connection} Connection to the specified address
     * @see {@link module:cytube-common/proxy/connection}
     */
    connect(address) {
        const [host, port] = address.split('/');
        if (!net.isIP(host) || isNaN(parseInt(port, 10))) {
            throw new Error(`Invalid address "${address}"`);
        }

        if (this.connections.hasOwnProperty(address)) {
            return this.connections[address];
        }

        this.connections[address] = this.newConnection(address);
        this.emit('connection', this.connections[address]);
        return this.connections[address];
    }

    /**
     * Forcibly close a Connection and ensure it is deleted from the
     * connection pool.
     *
     * @param {Connection} connection Connection to close
     */
    disconnect(connection) {
        const endpoint = connection.endpoint;
        delete this.connections[endpoint];
        connection.end();
    }

    /**
     * Open a new {@link Connection} to the specified address.
     *
     * @param {string} address Remote address of the format
     * <code>{hostname}/{port}</code>
     * @return {Connection} New connection to the specified address
     * @see {@link module:cytube-common/proxy/connection}
     * @private
     */
    newConnection(address) {
        const [host, port] = address.split('/');
        logger.info(`Opening connection to [${host}/${port}]`);
        const socket = net.connect(port, host);
        const connection = new Connection(socket, address);
        connection.on('close', this.onConnectionClose.bind(this, connection));
        connection.on('error', this.onConnectionError.bind(this, connection));

        return connection;
    }

    /**
     * Handle a <code>'close'</code> event fired by a Connection.
     *
     * @param {Connection} Connection that fired the event
     * @private
     */
    onConnectionClose(connection) {
        logger.info(`Connection to [${connection.endpoint}] was closed`);
        delete this.connections[connection.endpoint];
    }

    /**
     * Handle an <code>'error'</code> event fired by a Connection.
     *
     * @param {Connection} Connection that fired the event
     * @param {Error} error Error emitted with the event
     * @private
     */
    onConnectionError(connection, error) {
        logger.error(`Error from connection to [${connection.endpoint}]: ` +
                error
        );
    }
}

export default ConnectionManager
