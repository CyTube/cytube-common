var assert = require('assert');
var JSONProtocol = require('../../lib/proxy/protocol')['default'];

describe('JSONProtocol', function () {
    describe('newSocketConnectEvent', function () {
        it('serializes a SocketConnectEvent', function () {
            var protocol = new JSONProtocol();
            var event = protocol.newSocketConnectEvent('socket id', 'socket ip');
            var expected = {
                $type: 'SocketConnectEvent',
                socketID: 'socket id',
                socketIP: 'socket ip'
            };
            assert.deepStrictEqual(event, expected);
        });
    });

    describe('onEvent', function () {
        it('deserializes an event', function () {
            var protocol = new JSONProtocol();
            var expected = ['SocketConnectEvent', ['socket id', 'socket ip']];
            var result = protocol.deserializeEvent({
                $type: 'SocketConnectEvent',
                socketID: 'socket id',
                socketIP: 'socket ip'
            });
            assert.deepStrictEqual(result, expected);
        });

        it('throws when there is an unexpected event type', function () {
            var protocol = new JSONProtocol();
            var expected = new Error('Unknown event type FooEvent');
            try {
                var result = protocol.deserializeEvent({
                    $type: 'FooEvent'
                });
                assert.fail('Expected error due to unknown event type');
            } catch (error) {
                assert.deepStrictEqual(error, expected);
            }
        });
    });
});
