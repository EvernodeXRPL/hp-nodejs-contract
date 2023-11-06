import { controlMessages } from "./common";
import { PatchConfig } from "./patch-config";

// HotPocket contract context which is passed into every smart contract invocation.

export class ContractContext {

    #patchConfig = null;
    #controlChannel = null;

    constructor(hpargs, users, unl, controlChannel) {
        this.#patchConfig = new PatchConfig();
        this.#controlChannel = controlChannel;
        this.contractId = hpargs.contract_id;
        this.publicKey = hpargs.public_key;
        this.privateKey = hpargs.private_key;
        this.mode = hpargs.mode;
        this.timestamp = hpargs.timestamp;
        this.users = users;
        this.unl = unl; // Not available in read request mode.
        this.lclSeqNo = hpargs.lcl_seq_no; // Not available in read request mode.
        this.lclHash = hpargs.lcl_hash; // Not available in read request mode.
        this.nonConsensusRounds = hpargs.non_consensus_rounds; // Only available in fallback mode.
    }

    // Returns the config values in patch config.
    getConfig() {
        return this.#patchConfig.getConfig();
    }

    // Updates the config with given config object and save the patch config.
    updateConfig(config) {
        return this.#patchConfig.updateConfig(config);
    }

    // Updates the known-peers this node must attempt connections to.
    // toAdd: Array of strings containing peers to be added. Each string must be in the format of "<ip>:<port>".
    updatePeers(toAdd, toRemove) {
        return this.#controlChannel.send({
            type: controlMessages.peerChangeset,
            add: toAdd || [],
            remove: toRemove || []
        });
    }
}