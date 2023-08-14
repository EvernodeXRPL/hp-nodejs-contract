import { constants } from './common';

import fs from 'fs';

export interface Config {
    execute: boolean
    log: {
        enable: boolean
        max_mbytes_per_file: number
        max_file_count: number
    }
    version: string
    unl: string[],
    bin_path: string
    bin_args: string
    environment: Record<string, string>
    max_input_ledger_offset: number
    consensus: {
        mode: "private" | "public"
        roundtime: number
        stage_slice: number
        threshold: number
    }
    npl: {
       mode: "private" | "public"
    }
    round_limits: {
        user_input_bytes: number
        user_output_bytes: number
        npl_output_bytes: number
        proc_cpu_seconds: number
        proc_mem_bytes: number
        proc_ofd_count: number
    }
}

// Handles patch config manipulation.
export class PatchConfig {

    // Loads the config value if there's a patch config file. Otherwise throw error.
    getConfig() {
        if (!fs.existsSync(constants.PATCH_CONFIG_PATH))
            throw "Patch config file does not exist.";

        return new Promise((resolve, reject) => {
            fs.readFile(constants.PATCH_CONFIG_PATH, 'utf8', function (err: any, data: string) {
                if (err) reject(err);
                else resolve(JSON.parse(data));
            });
        });
    }

  updateConfig(config: Config) {

        this.validateConfig(config);

        return new Promise<void>((resolve, reject) => {
            // Format json to match with the patch.cfg json format created by HP at the startup.
            fs.writeFile(constants.PATCH_CONFIG_PATH, JSON.stringify(config, null, 4), (err: any) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    validateConfig(config: Config) {
        // Validate all config fields.
        if (!config.version)
            throw "Contract version is not specified.";
        if (!config.unl || !config.unl.length)
            throw "UNL list cannot be empty.";
        for (let publicKey of config.unl) {
            // Public keys are validated against length, ed prefix and hex characters.
            if (!publicKey.length)
                throw "UNL public key not specified.";
            else if (!(/^(e|E)(d|D)[0-9a-fA-F]{64}$/g.test(publicKey)))
                throw "Invalid UNL public key specified.";
        }
        if (!config.bin_path || !config.bin_path.length)
            throw "Binary path cannot be empty.";
        if (config.consensus.mode != "public" && config.consensus.mode != "private")
            throw "Invalid consensus mode configured in patch file. Valid values: public|private";
        if (config.consensus.roundtime < 1 && config.consensus.roundtime > 3600000)
            throw "Round time must be between 1 and 3600000ms inclusive.";
        if (config.consensus.stage_slice < 1 || config.consensus.stage_slice > 33)
            throw "Stage slice must be between 1 and 33 percent inclusive.";
        if (config.consensus.threshold < 1 || config.consensus.threshold > 100)
            throw "Consensus threshold must be between 1 and 100 percent inclusive.";
        if (config.npl.mode != "public" && config.npl.mode != "private")
            throw "Invalid npl mode configured in patch file. Valid values: public|private";
        if (config.round_limits.user_input_bytes < 0 || config.round_limits.user_output_bytes < 0 || config.round_limits.npl_output_bytes < 0 ||
            config.round_limits.proc_cpu_seconds < 0 || config.round_limits.proc_mem_bytes < 0 || config.round_limits.proc_ofd_count < 0)
            throw "Invalid round limits.";
        if (config.max_input_ledger_offset < 0)
            throw "Invalid max input ledger offset";
    }
}
