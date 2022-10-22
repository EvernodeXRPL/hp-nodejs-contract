import { constants, writeAsync } from './common';

const fs = require('fs');

// Represents the node-party-line that can be used to communicate with unl nodes.
export class NplChannel {

    #fd = null;
    #readStream = null;

    constructor(fd) {
        this.#fd = fd;
    }

    consume(onMessage) {

        if (this.#readStream)
            throw "NPL channel already consumed.";

        this.#readStream = fs.createReadStream(null, { fd: this.#fd, highWaterMark: constants.MAX_SEQ_PACKET_SIZE });

        // When hotpocket is sending the npl messages, first it sends the public key of the particular node
        // and then the message, First data buffer is taken as public key and the second one as message,
        // then npl message object is constructed and the event is emmited.
        let publicKey = null;

        this.#readStream.on("data", (data) => {
            if (!publicKey) {
                publicKey = data.toString();
            }
            else {
                onMessage(publicKey, data);
                publicKey = null;
            }
        });

        this.#readStream.on("error", (err) => { });
    }

    send(msg) {
        const buf = Buffer.from(msg);
        if (buf.length > constants.MAX_SEQ_PACKET_SIZE)
            throw ("NPL message exceeds max size " + constants.MAX_SEQ_PACKET_SIZE);
        return writeAsync(this.#fd, buf);
    }

    close() {
        this.#readStream && this.#readStream.close();
    }
}
