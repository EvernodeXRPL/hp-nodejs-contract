const { clientProtocols, constants } = require("./common");
const { HotPocketContract } = require("./hotpocket-contract");

module.exports = {
    Contract: HotPocketContract,
    clientProtocols,
    POST_EXEC_SCRIPT_NAME: constants.POST_EXEC_SCRIPT_NAME,
}