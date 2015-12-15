import { EventEmitter } from 'events';

export default class Subscriber extends EventEmitter {
    constructor(subClient, dataClient, queueName, channelName) {
        super();
        this.queueName = queueName;
        this.channelName = channelName;
        this.subClient = subClient;
        this.dataClient = dataClient;

        this.subClient.subscribe(this.channelName);
        this.subClient.on('message', this.onMessage.bind(this));
    }

    onMessage(channel, message) {
        if (channel !== this.channelName) {
            return;
        }

        this.poll();
    }

    poll() {
        this.dataClient.multi()
                .lrange(this.queueName, 0, -1)
                .del(this.queueName)
                .execAsync()
                .then(replies => {

            replies[0].forEach(message => {
                const data = JSON.parse(message);
                this.emit('message', data.payload, data.time);
            });
        });
    }
}
