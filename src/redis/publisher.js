export default class Publisher {
    constructor(redisClient, queueName, channelName, timeout) {
        this.redisClient = redisClient;
        this.queueName = queueName;
        this.channelName = channelName;
        this.timeout = timeout || 0;
    }

    publish(message) {
        return this.publishBatch([message]);
    }

    publishBatch(messages) {
        const time = Date.now();
        const multi = this.redisClient.multi();

        messages.forEach(message => {
            const data = JSON.stringify({
                time: time,
                payload: message
            });
            multi.rpush(this.queueName, data);
        });

        if (this.timeout > 0) {
            multi.expire(this.queueName, this.timeout);
        }

        return multi.publish(this.channelName, time)
                .execAsync();
    }
}
