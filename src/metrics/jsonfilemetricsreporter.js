import fs from 'fs';
import winston from 'winston';

/** MetricsReporter that records metrics as JSON objects in a file, one per line */
class JSONFileMetricsReporter {
    /**
     * Create a new JSONFileMetricsReporter that writes to the given file path.
     *
     * @param {string} filename file path to write to
     */
    constructor(filename) {
        this.writeStream = fs.createWriteStream(filename, { flags: 'a' });
        this.metrics = {};
    }

    /**
     * @see {@link module:cytube-common/metrics/metrics.incCounter}
     */
    incCounter(counter, value) {
        if (!this.metrics.hasOwnProperty(counter)) {
            this.metrics[counter] = 0;
        }

        this.metrics[counter] += value;
    }

    /**
     * @see {@link module:cytube-common/metrics/metrics.addProperty}
     */
    addProperty(property, value) {
        this.metrics[property] = value;
    }

    report() {
        const line = JSON.stringify(this.metrics) + '\n';
        try {
            this.writeStream.write(line);
        } finally {
            this.metrics = {};
        }
    }
}

export { JSONFileMetricsReporter };
