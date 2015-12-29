import { EventEmitter } from 'events';
import logger from '../logger';
import Connection from './connection';
import net from 'net';

export default class ConnectionManager extends EventEmitter {
    constructor() {
        super();
        this.connections = {};
    }

    connect(address) {
        if (this.connections.hasOwnProperty(address)) {
            return this.connections[address];
        }

        this.connections[address] = this.newConnection(address);
        this.emit('connection', this.connections[address]);
        return this.connections[address];
    }

    disconnect(connection) {
        const endpoint = connection.endpoint;
        delete this.connections[endpoint];
        connection.end();
    }

    newConnection(address) {
        const [host, port] = address.split('/');
        logger.info(`Opening connection to [${host}/${port}]`);
        const socket = net.connect(port, host);
        const connection = new Connection(socket, address);
        connection.on('close', this.onConnectionClose.bind(this, connection));
        connection.on('error', this.onConnectionError.bind(this, connection));

        return connection;
    }

    onConnectionClose(connection) {
        logger.info(`Connection to [${connection.endpoint}] was closed`);
        delete this.connections[connection.endpoint];
    }

    onConnectionError(connection, error) {
        logger.error(`Error from connection to [${connection.endpoint}]: ` +
                error
        );
    }
}
