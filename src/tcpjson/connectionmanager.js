import logger from '../logger';
import Connection from './connection';
import net from 'net';

export default class ConnectionManager {
    constructor() {
        this.connections = {};
    }

    connect(address) {
        if (this.connections.hasOwnProperty(address)) {
            return this.connections[address];
        }

        return this.connections[address] = this.newConnection(address);
    }

    newConnection(address) {
        const [host, port] = address.split('/');
        logger.info(`Opening connection to [${host}/${port}]`);
        const socket = net.connect(port, host);
        const connection = new Connection(socket);
        connection.address = address;
        connection.on('close', this.onConnectionClose.bind(this, connection));

        return connection;
    }

    onConnectionClose(connection) {
        logger.info(`Connection to [${connection.address}] was closed`);
        delete this.connections[connection.address];
    }
}
