import { clientProtocols, readAsync, writevAsync } from "./common";

export class UsersCollection {

    #users: Record<string, User> = {};
    #infd: number;

   constructor(userInputsFd: number, usersObj: any, clientProtocol: typeof clientProtocols[keyof typeof clientProtocols]) {
        this.#infd = userInputsFd;

        Object.entries(usersObj).forEach(([publicKey, arr]: any) => {

            const outfd = arr[0]; // First array element is the output fd.
            arr.splice(0, 1); // Remove first element (output fd). The rest are pairs of msg offset/length tuples.

            const channel = new UserChannel(outfd, clientProtocol);
            this.#users[publicKey] = new User(publicKey, channel, arr);
        });
    }

    // Returns the User for the specified public key. Returns null if not found.
    find(publicKey: string) {
        return this.#users[publicKey]
    }

    // Returns all the currently connected users.
    list() {
        return Object.values(this.#users);
    }

    count() {
        return Object.keys(this.#users).length;
    }

    async read(input: Buffer) {
        const [offset, size] = input;
        const buf = Buffer.alloc(size);
        await readAsync(this.#infd, buf, offset, size);
        return buf;
    }
}

export class User {

    publicKey: string;
    inputs: Buffer[];
    #channel;


    constructor(publicKey:string, channel: UserChannel, inputs: Buffer[]) {
        this.publicKey = publicKey;
        this.inputs = inputs;
        this.#channel = channel;
    }

    async send(msg: any) {
        await this.#channel.send(msg);
    }
}

export class UserChannel {

    #outfd: number
    #clientProtocol: typeof clientProtocols[keyof typeof clientProtocols]

    constructor(outfd: number, clientProtocol: typeof clientProtocols[keyof typeof clientProtocols]) {
        this.#outfd = outfd;
        this.#clientProtocol = clientProtocol;
    }

    send(msg: any) {
        const messageBuf = this.serialize(msg);
        let headerBuf = Buffer.alloc(4);
        // Writing message length in big endian format.
        headerBuf.writeUInt32BE(messageBuf.byteLength)
        return writevAsync(this.#outfd, [headerBuf, messageBuf]);
    }

    serialize(msg: any) {

        if (!msg)
            throw "Cannot serialize null content.";

        if (Buffer.isBuffer(msg))
            return msg;
        else if (this.#clientProtocol == clientProtocols.bson)
            return Buffer.from(msg);
        else // json
            return Buffer.from(JSON.stringify(msg));
    }
}
