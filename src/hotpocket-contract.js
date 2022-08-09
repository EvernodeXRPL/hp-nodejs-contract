import { clientProtocols, controlMessages, errHandler, invokeCallback } from './common';
import { ContractContext } from './contract-context';
import { ControlChannel } from './control';
import { NplChannel } from './npl';
import { UnlCollection } from './unl';
import { UsersCollection } from './user';

const fs = require('fs');
const tty = require('tty');

export class HotPocketContract {

    #controlChannel = null;
    #clientProtocol = null;

    init(contractFunc, clientProtocol = clientProtocols.json) {

        return new Promise(resolve => {
            if (this.#controlChannel) { // Already initialized.
                resolve(false);
                return;
            }

            this.#clientProtocol = clientProtocol;

            // Check whether we are running on a console and provide error.
            if (tty.isatty(process.stdin.fd)) {
                console.error("Error: HotPocket smart contracts must be executed via HotPocket.");
                resolve(false);
                return;
            }

            // Parse HotPocket args.
            fs.readFile(process.stdin.fd, 'utf8', (err, argsJson) => {
                const hpargs = JSON.parse(argsJson);
                this.#controlChannel = new ControlChannel(hpargs.control_fd);
                this.#executeContract(hpargs, contractFunc);
                resolve(true);
            });
        });
    }

    #executeContract(hpargs, contractFunc) {
        // Keeps track of all the tasks (promises) that must be awaited before the termination.
        const pendingTasks = [];
        const nplChannel = new NplChannel(hpargs.npl_fd);

        const users = new UsersCollection(hpargs.user_in_fd, hpargs.users, this.#clientProtocol);
        const unl = new UnlCollection(hpargs.readonly, hpargs.unl, nplChannel, pendingTasks);
        const executionContext = new ContractContext(hpargs, users, unl, this.#controlChannel);

        invokeCallback(contractFunc, executionContext).catch(errHandler).finally(() => {
            // Wait for any pending tasks added during execution.
            Promise.all(pendingTasks).catch(errHandler).finally(() => {
                nplChannel.close();
                this.#terminate();
            });
        });
    }

    #terminate() {
        this.#controlChannel.send({ type: controlMessages.contractEnd });
        this.#controlChannel.close();
    }
}