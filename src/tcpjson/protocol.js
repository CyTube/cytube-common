export function socketConnect(socketID, socketIP) {
    return {
        action: 'socketConnect',
        socketID: socketID,
        socketData: {
            ip: socketIP
        }
    };
}

export function socketFrame(socketID, event, args) {
    return {
        action: 'socketFrame',
        socketID: socketID,
        event: event,
        args: args
    };
}

export function socketDisconnect(socketID) {
    return {
        action: 'socketDisconnect',
        socketID: socketID
    };
}

export function socketJoinSocketChannels(socketID, channels) {
    return {
        action: 'socketJoinSocketChannel',
        socketID: socketID,
        channels: channels
    };
}

export function socketKick(socketID, reason) {
    return {
        action: 'socketKick',
        socketID: socketID,
        reason: reason
    };
}
