import { NplChannel } from "npl";
import { invokeCallback } from "./common";

export class UnlCollection {
  
    nodes: Record<string,any>;
    #readonly: boolean;
    #pendingTasks: any[]
    #channel: NplChannel | null = null;

    constructor(readonly: boolean, unl: any, channel: NplChannel, pendingTasks: any[]) {
        this.nodes = {};
        this.#readonly = readonly;
        this.#pendingTasks = pendingTasks;

        if (!readonly) {
            for (const [publicKey, stat] of Object.entries(unl)) {
                /// @ts-ignore
                this.nodes[publicKey] = new UnlNode(publicKey, stat.active_on);
            }

            this.#channel = channel;
        }
    }

    // Returns the unl node for the specified public key. Returns null if not found.
    find(publicKey: string) {
        return this.nodes[publicKey];
    }

    // Returns all the unl nodes.
    list() {
        return Object.values(this.nodes);
    }

    count() {
        return Object.keys(this.nodes).length;
    }

    // Registers for NPL messages.
    onMessage(callback: any) {

        if (this.#readonly)
            throw "NPL messages not available in readonly mode.";

        this.#channel!.consume((publicKey: string, msg) => {
            this.#pendingTasks.push(invokeCallback(callback, this.nodes[publicKey], msg));
        });
    }

    // Broadcasts a message to all unl nodes (including self if self is part of unl).
    async send(msg: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) {
        if (this.#readonly)
            throw "NPL messages not available in readonly mode.";

        await this.#channel!.send(msg);
    }
}

// Represents a node that's part of unl.
export class UnlNode {

    constructor(public publicKey: string, public activeOn: number) {}
}
