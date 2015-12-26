export function socketConnect(socketID, socketIP) {
    return {
        $type: 'socketConnect',
        socketID: socketID,
        socketData: {
            ip: socketIP
        }
    };
}

export function socketFrame(socketID, event, args) {
    return {
        $type: 'socketFrame',
        socketID: socketID,
        event: event,
        args: args
    };
}

export function socketDisconnect(socketID) {
    return {
        $type: 'socketDisconnect',
        socketID: socketID
    };
}

export function socketJoinSocketChannels(socketID, channels) {
    return {
        $type: 'socketJoinSocketChannel',
        socketID: socketID,
        channels: channels
    };
}

export function socketKick(socketID, reason) {
    return {
        $type: 'socketKick',
        socketID: socketID,
        reason: reason
    };
}
