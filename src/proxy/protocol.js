import lo from 'lodash';
import JSONStream from 'JSONStream';

/** @module cytube-common/proxy/protocol */

const SLICE = Array.prototype.slice;

/**
 * Protocol that sends JSON objects over the wire and uses
 * the <code>JSONStream</code> module to deserialize the stream.
 */
class JSONProtocol {
    /**
     * Create a new parser to transform incoming data.
     * @returns JSONStream instance
     */
    streamParser() {
        return JSONStream.parse();
    }

    /**
     * Serialize JSON event data created with protocol.newXXXEvent(...).
     *
     * @param {Object} data data to serialize
     */
    serializeEvent(data) {
        return JSON.stringify(data);
    }

    /**
     * Deserialize a received event.
     *
     * @param {Object} data incoming data
     * @return {Array} array of event type name and arguments
     */
    deserializeEvent(data) {
        if (!this['_propNames' + data.$type]) {
            throw new Error(`Unknown event type ${data.$type}`);
        }

        const args = [];
        this['_propNames' + data.$type].forEach(propName => {
            args.push(data[propName]);
        });

        return [data.$type, args];
    }
}

export default JSONProtocol

/**
 * Add an event generator to a Protocol.
 *
 * @param {Object} Protocol protocol to add the event generator to
 * @param {string} eventName Event name
 * @param {Array<string>} propNames List of event argument names
 */
function register(Protocol, eventName, propNames) {
    Protocol.prototype['new' + eventName] = function createEvent() {
        const args = SLICE.call(arguments);
        const event = {
            $type: eventName
        };
        lo.zip(propNames, arguments).forEach(([propName, propValue]) => {
            event[propName] = propValue;
        });

        return event;
    };

    Protocol.prototype['_propNames' + eventName] = propNames;
}

/**
 * Event sent when a socket.io connection is proxied.
 *
 * @function newSocketConnectEvent
 * @param {string} socketID socket.io unique socket ID
 * @param {string} socketIP IP address of the remote client
 * @param {Object} socketUser user login data (name, globalRank)
 */
register(JSONProtocol, 'SocketConnectEvent', ['socketID', 'socketIP', 'socketUser']);

/**
 * Event sent when a socket.io event is proxied.
 *
 * @function newSocketFrameEvent
 * @param {string} socketID socket.io unique socket ID
 * @param {string} event socket.io event name
 * @param {Array} args socket.io event args
 */
register(JSONProtocol, 'SocketFrameEvent', ['socketID', 'event', 'args']);

/**
 * Event sent when a socket.io connection is disconnected.
 *
 * @function newSocketDisconnectEvent
 * @param {string} socketID socket.io unique socket ID
 */
register(JSONProtocol, 'SocketDisconnectEvent', ['socketID']);

/**
 * Event sent when the backend requests the socket.io socket be joined
 * to socket.io rooms.
 *
 * @function newSocketJoinRoomsEvent
 * @param {string} socketID socket.io unique socket ID
 * @param {Array<string>} roomList list of rooms to join
 */
register(JSONProtocol, 'SocketJoinRoomsEvent', ['socketID', 'roomList']);

/**
 * Event sent when the backend requests a socket.io socket be forced
 * to disconnect.
 *
 * @function newSocketKickEvent
 * @param {string} socketID socket.io unique socket ID
 * @param {strong} reason optional reason for the disconnect
 */
register(JSONProtocol, 'SocketKickEvent', ['socketID', 'reason']);
