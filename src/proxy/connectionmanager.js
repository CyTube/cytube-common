import { EventEmitter } from 'events';
import logger from '../logger';
import Connection from './connection';
import net from 'net';
import { parseAddress } from '../util/addressutil';

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
    constructor(protocol) {
        super();
        this.connections = {};
        this.protocol = protocol;
    }

    /**
     * Get a Connection to the specified address.  If one is not already
     * available, open a new connection.
     *
     * @param {string} address Remote address
     * @return {Connection} Connection to the specified address
     * @see {@link module:cytube-common/proxy/connection}
     */
    connect(address) {
        const { hostname, port } = parseAddress(address);
        if (hostname === null || port === null) {
            throw new Error(`Invalid address "${address}"`);
        }

        if (this.connections.hasOwnProperty(address)) {
            return this.connections[address];
        }

        this.connections[address] = this.newConnection(address, hostname, port);
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
     * @param {string} address Remote address
     * @param {string} hostname pre-parsed hostname
     * @param {string} port pre-parsed port
     * @return {Connection} New connection to the specified address
     * @see {@link module:cytube-common/proxy/connection}
     * @private
     */
    newConnection(address, hostname, port) {
        logger.info(`Opening connection to [${address}]`);
        const socket = net.connect(port, hostname);
        const connection = new Connection(socket, address, this.protocol);
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
        connection.disconnected = true;
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
