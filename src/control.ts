import fs from 'fs';
import { constants, writeAsync } from './common';

export class ControlChannel {

    #fd: number
    #readStream:fs.ReadStream | null = null;

    constructor(fd: number) {
        this.#fd = fd;
    }

    consume(onMessage: (chunk: string | Buffer) => void) {

        if (this.#readStream)
            throw "Control channel already consumed.";

        this.#readStream = fs.createReadStream(null as any, { fd: this.#fd, highWaterMark: constants.MAX_SEQ_PACKET_SIZE });
        this.#readStream.on("data", onMessage);
        this.#readStream.on("error", (err) => { });
    }

    send(obj: any) {
        const buf = Buffer.from(JSON.stringify(obj));
        if (buf.length > constants.MAX_SEQ_PACKET_SIZE)
            throw ("Control message exceeds max size " + constants.MAX_SEQ_PACKET_SIZE);
        return writeAsync(this.#fd, buf);
    }

    close() {
        this.#readStream && this.#readStream.close();
    }
}
