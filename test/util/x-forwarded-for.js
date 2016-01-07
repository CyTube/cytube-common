const assert = require('assert');
const resolveIP = require('../../lib/util/x-forwarded-for').resolveIP;

describe('x-forwarded-for', function () {
    describe('#resolveIP', function () {
        var config;
        beforeEach(function () {
            config = {
                isTrustedProxy: function (ip) {
                    return ip === '127.0.0.1';
                }
            };
        });

        it('returns the original IP if it\'s not a trusted proxy', function () {
            const ip = '99.99.99.99';
            const xForwardedFor = '88.88.88.88';
            assert.strictEqual(resolveIP(config, ip, xForwardedFor), ip);
        });

        it('returns the original IP if no xForwardedFor is provided', function () {
            const ip = '99.99.99.99';
            const xForwardedFor = null;
            assert.strictEqual(resolveIP(config, ip, xForwardedFor), ip);
        });

        it('returns the original IP if no xForwardedFor is valid', function () {
            const ip = '99.99.99.99';
            const xForwardedFor = 'a.b.c.d,e.f.g.h';
            assert.strictEqual(resolveIP(config, ip, xForwardedFor), ip);
        });

        it('returns the first valid forwarded IP', function () {
            const ip = '127.0.0.1';
            const xForwardedFor = 'a.b.c.d,   1.2.3.4';
            assert.strictEqual(resolveIP(config, ip, xForwardedFor), '1.2.3.4');
        });

        it('handles ipv6', function () {
            const ip = '127.0.0.1';
            const xForwardedFor = '2001::abcd';
            assert.strictEqual(resolveIP(config, ip, xForwardedFor), '2001::abcd');
        });
    });
});
