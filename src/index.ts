import type { ContractContext } from "./contract-context";
import { clientProtocols, constants } from "./common";
import { HotPocketContract } from "./hotpocket-contract";

const POST_EXEC_SCRIPT_NAME = constants.POST_EXEC_SCRIPT_NAME;
export {
    HotPocketContract as Contract,
    clientProtocols,
    POST_EXEC_SCRIPT_NAME,
}
export type { ContractContext };
