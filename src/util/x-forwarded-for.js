import net from 'net';

/** @module cytube-common/util/x-forwarded-for */

/**
 * Resolve the real IP address of a client based on trusted proxy configuration.
 *
 * @param {Object} config configuration object that exposes an
 * <code>isTrustedProxy(ip)</code> function
 * @param {string} realIP raw IP address of the remote client
 * @param {string} xForwardedFor value of the X-Forwarded-For header
 * @return true IP address of the remote client
 */
export function resolveIP(config, realIP, xForwardedFor) {
    if (!config.isTrustedProxy(realIP) || typeof xForwardedFor !== 'string') {
        return realIP;
    }

    const ipList = xForwardedFor.split(',');
    for (let i = 0; i < ipList.length; i++) {
        const ip = ipList[i].trim();
        if (net.isIP(ip)) {
            return ip;
        }
    }

    return realIP;
}
