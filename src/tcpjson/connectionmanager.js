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
        const [host, port] = address.split(',');
        const socket = net.connect(port, host);
        const connection = new Connection(socket);

        return connection;
    }
}
