export class UsersCollection {

    #users = {};
    #infd = null;

    constructor(userInputsFd, usersObj, clientProtocol) {
        this.#infd = userInputsFd;

        Object.entries(usersObj).forEach(([pubKey, arr]) => {

            const outfd = arr[0]; // First array element is the output fd.
            arr.splice(0, 1); // Remove first element (output fd). The rest are pairs of msg offset/length tuples.

            const channel = new UserChannel(outfd, clientProtocol);
            this.#users[pubKey] = new User(pubKey, channel, arr);
        });
    }

    // Returns the User for the specified pubkey. Returns null if not found.
    find(pubKey) {
        return this.#users[pubKey]
    }

    // Returns all the currently connected users.
    list() {
        return Object.values(this.#users);
    }

    count() {
        return Object.keys(this.#users).length;
    }

    async read(input) {
        const [offset, size] = input;
        const buf = Buffer.alloc(size);
        await readAsync(this.#infd, buf, offset, size);
        return buf;
    }
}

export class User {

    #channel = null;

    constructor(pubKey, channel, inputs) {
        this.pubKey = pubKey;
        this.inputs = inputs;
        this.#channel = channel;
    }

    async send(msg) {
        await this.#channel.send(msg);
    }
}

export class UserChannel {

    #outfd = null;
    #clientProtocol = null;

    constructor(outfd, clientProtocol) {
        this.#outfd = outfd;
        this.#clientProtocol = clientProtocol;
    }

    send(msg) {
        const messageBuf = this.serialize(msg);
        let headerBuf = Buffer.alloc(4);
        // Writing message length in big endian format.
        headerBuf.writeUInt32BE(messageBuf.byteLength)
        return writevAsync(this.#outfd, [headerBuf, messageBuf]);
    }

    serialize(msg) {

        if (!msg)
            throw "Cannot serialize null content.";

        if (Buffer.isBuffer(msg))
            return msg;

        if (this.#clientProtocol == clientProtocols.bson) {
            return Buffer.from(msg);
        }
        else { // json

            // In JSON, we need to ensure that the final buffer contains a string.
            if (typeof msg === "string" || msg instanceof String)
                return Buffer.from(msg);
            else
                return Buffer.from(JSON.stringify(msg));
        }
    }
}