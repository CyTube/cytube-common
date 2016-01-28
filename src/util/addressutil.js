import url from 'url';

/** @module cytube-common/util/addressutil */

export const PROTOCOL_TCP = 'tcp';
export const PROTOCOL_TCP_SECURE = 'tcps';
export const PROTOCOL_WS = 'ws';
export const PROTOCOL_WS_SECURE = 'wss';

/**
 * Parse a formatted address into its { hostname, port, protocol }
 *
 * @param {string} address formatted address to parse
 * @return {object} parsed address
 */
export function parseAddress(address) {
    return url.parse(address);
}

/**
 * Format an address with the given protocol, hostname, and port
 *
 * @param {string} protocol address protocol, e.g. 'tcp'
 * @param {string} hostname hostname of the address
 * @param {string|number} port port of the address
 * @return {string} formatted address
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
 * @param {string} hostname proxy hostname or IP address
 * @param {string|number} port proxy port
 * @param {boolean} secure whether the address represents a TLS server (default false)
 * @return {string} formatted address
 */
export function formatProxyAddress(hostname, port, secure = false) {
    const protocol = secure ? PROTOCOL_TCP_SECURE : PROTOCOL_TCP;
    return formatAddress(protocol, hostname, port);
}

/**
 * Format a websocket address with the given hostname and port
 *
 * @param {string} hostname websocket hostname or IP address
 * @param {string|number} port websocket port
 * @param {boolean} secure whether the address represents a TLS server (default false)
 * @return {string} formatted address
 */
export function formatWebsocketAddress(hostname, port, secure = false) {
    const protocol = secure ? PROTOCOL_WS_SECURE : PROTOCOL_WS;
    return formatAddress(protocol, hostname, port);
}

/**
 * Test whether an address is using a secure protocol.
 *
 * @param {string} address address to check
 * @return {boolean} whether the address begins with a secure protocol
 */
export function isSecure(address) {
    const protocol = parseAddress(address).protocol.replace(':', '');
    return protocol === PROTOCOL_TCP_SECURE || protocol === PROTOCOL_WS_SECURE;
}
