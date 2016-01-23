import url from 'url';

/** @module cytube-common/util/addressutil */

export const PROTOCOL_TCP = 'tcp';
export const PROTOCOL_TCP_SECURE = 'tcps';
export const PROTOCOL_WS = 'ws';
export const PROTOCOL_WS_SECURE = 'wss';

/**
 * Parse a formatted address into its { hostname, port, protocol }
 *
 * @param address formatted address to parse
 */
export function parseAddress(address) {
    return url.parse(address);
}

/**
 * Format an address with the given protocol, hostname, and port
 *
 * @param protocol address protocol, e.g. 'tcp'
 * @param hostname hostname of the address
 * @param port port of the address
 */
export function formatAddress(protocol, hostname, port) {
    return url.format({
        protocol,
        hostname,
        port,
        slashes: true
    });
}

/**
 * Format an internal proxy address with the given hostname and port
 *
 * @param hostname proxy hostname or IP address
 * @param port proxy port
 * @param secure whether the address represents a TLS server (default false)
 */
export function formatProxyAddress(hostname, port, secure = false) {
    const protocol = secure ? PROTOCOL_TCP_SECURE : PROTOCOL_TCP;
    return formatAddress(protocol, hostname, port);
}

/**
 * Format a websocket address with the given hostname and port
 *
 * @param hostname websocket hostname or IP address
 * @param port websocket port
 * @param secure whether the address represents a TLS server (default false)
 */
export function formatWebsocketAddress(hostname, port, secure = false) {
    const protocol = secure ? PROTOCOL_WS_SECURE : PROTOCOL_WS;
    return formatAddress(protocol, hostname, port);
}
