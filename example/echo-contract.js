const HotPocket = require("hotpocket-nodejs-contract");

// HP smart contract is defined as a function which takes HP ExecutionContext as an argument.
// HP considers execution as complete, when this function completes and all the NPL message callbacks are complete.
const echoContract = async (ctx) => {

    // Collection of per-user promises to wait for. Each promise completes when inputs for that user is processed.
    const userHandlers = [];

    for (const user of ctx.users.list()) {

        // This user's hex public key can be accessed from 'user.publicKey'

        // For each user we add a promise to list of promises.
        userHandlers.push(new Promise(async (resolve) => {

            // The contract need to ensure that all outputs for a particular user is emitted
            // in deterministic order. Hence, we are processing all inputs for each user sequentially.
            for (const input of user.inputs) {

                const buf = await ctx.users.read(input);
                const msg = buf.toString();

                const output = "Echoing: " + msg;
                await user.send(output);

            }

            // The promise gets completed when all inputs for this user are processed.
            resolve();
        }));
    }

    // Wait until all user promises are complete.
    await Promise.all(userHandlers);

    // Get the user identified by public key.
    // ctx.users.find("<public key hex>");

    // Get list of all unl nodes in the cluster.
    // ctx.unl.list();

    // Get the unl node identified by public key.
    // ctx.unl.find("<public key hex>");

    // NPL messages example.
    // if (!ctx.readonly) {
    //     ctx.unl.onMessage((node, msg) => {
    //         console.log(msg + " from " + node.publicKey);
    //     })
    //     await ctx.unl.send("Hello");
    // }

    // Update patch config
    // const config = await ctx.getConfig();
    // config.unl.push("edf3f3bff36e22d0e1c7abf791ca4900e717754443b8e861dcfbf1cd2bbd0f6159");
    // await ctx.updateConfig(config);
}

const hpc = new HotPocket.Contract();
hpc.init(echoContract);