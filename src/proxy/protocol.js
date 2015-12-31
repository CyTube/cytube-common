import lo from 'lodash';

const SLICE = Array.prototype.slice;

export default class JSONProtocol {
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

register(JSONProtocol, 'SocketConnectEvent', ['socketID', 'socketIP', 'socketUser']);
register(JSONProtocol, 'SocketFrameEvent', ['socketID', 'event', 'args']);
register(JSONProtocol, 'SocketDisconnectEvent', ['socketID']);
register(JSONProtocol, 'SocketJoinRoomsEvent', ['socketID', 'roomList']);
register(JSONProtocol, 'SocketKickEvent', ['socketID', 'reason']);
