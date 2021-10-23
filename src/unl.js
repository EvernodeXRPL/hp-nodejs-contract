export class UnlCollection {

    #readonly = null;
    #pendingTasks = null;
    #channel = null;

    constructor(readonly, unl, channel, pendingTasks) {
        this.nodes = {};
        this.#readonly = readonly;
        this.#pendingTasks = pendingTasks;

        if (!readonly) {
            unl.forEach(pubKey => {
                this.nodes[pubKey] = new UnlNode(pubKey);
            });

            this.#channel = channel;
        }
    }

    // Returns the unl node for the specified pubkey. Returns null if not found.
    find(pubKey) {
        return this.nodes[pubKey];
    }

    // Returns all the unl nodes.
    list() {
        return Object.values(this.nodes);
    }

    count() {
        return Object.keys(this.nodes).length;
    }

    // Registers for NPL messages.
    onMessage(callback) {

        if (this.#readonly)
            throw "NPL messages not available in readonly mode.";

        this.#channel.consume((pubKey, msg) => {
            this.#pendingTasks.push(invokeCallback(callback, this.nodes[pubKey], msg));
        });
    }

    // Broadcasts a message to all unl nodes (including self if self is part of unl).
    async send(msg) {
        if (this.#readonly)
            throw "NPL messages not available in readonly mode.";

        await this.#channel.send(msg);
    }
}

// Represents a node that's part of unl.
export class UnlNode {

    constructor(pubKey) {
        this.pubKey = pubKey;
    }
}