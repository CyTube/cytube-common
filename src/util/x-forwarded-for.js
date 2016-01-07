import net from 'net';

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
