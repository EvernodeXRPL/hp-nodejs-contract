import { ControlChannel } from "control";
import { controlMessages } from "./common";
import { Config, PatchConfig } from "./patch-config";
import { UsersCollection } from "user";
import { UnlCollection } from "unl";

// HotPocket contract context which is passed into every smart contract invocation.

export class ContractContext {

    #patchConfig: PatchConfig;
    #controlChannel: ControlChannel;
    contractId: string
    publicKey: string
    privateKey: string
    readonly: boolean
    timestamp: number
    users: UsersCollection
    unl: UnlCollection
    lclSeqNo: number
    lclHash:number

    constructor(hpargs: any, users: UsersCollection, unl: UnlCollection, controlChannel: ControlChannel) {
        this.#patchConfig = new PatchConfig();
        this.#controlChannel = controlChannel;
        this.contractId = hpargs.contract_id;
        this.publicKey = hpargs.public_key;
        this.privateKey = hpargs.private_key;
        this.readonly = hpargs.readonly;
        this.timestamp = hpargs.timestamp;
        this.users = users;
        this.unl = unl; // Not available in readonly mode.
        this.lclSeqNo = hpargs.lcl_seq_no; // Not available in readonly mode.
        this.lclHash = hpargs.lcl_hash; // Not available in readonly mode.
    }

    // Returns the config values in patch config.
    getConfig() {
        return this.#patchConfig.getConfig();
    }

    // Updates the config with given config object and save the patch config.
    updateConfig(config: Config) {
        return this.#patchConfig.updateConfig(config);
    }

    // Updates the known-peers this node must attempt connections to.
    // toAdd: Array of strings containing peers to be added. Each string must be in the format of "<ip>:<port>".
    updatePeers(toAdd?: string[], toRemove?: string[]) {
        return this.#controlChannel.send({
            type: controlMessages.peerChangeset,
            add: toAdd || [],
            remove: toRemove || []
        });
    }
}
