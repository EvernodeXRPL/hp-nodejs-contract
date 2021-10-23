export const controlMessages = {
    contractEnd: "contract_end",
    unlChangeset: "unl_changeset"
}
Object.freeze(controlMessages);

export const clientProtocols = {
    json: "json",
    bson: "bson"
}
Object.freeze(clientProtocols);

export const MAX_SEQ_PACKET_SIZE = 128 * 1024;
export const PATCH_CONFIG_PATH = "../patch.cfg";
export const POST_EXEC_SCRIPT_NAME = "post_exec.sh";

export function writeAsync(fd, buf) {
    return new Promise(resolve => fs.write(fd, buf, resolve));
}
export function writevAsync(fd, bufList) {
    return new Promise(resolve => fs.writev(fd, bufList, resolve));
}
export function readAsync(fd, buf, offset, size) {
    return new Promise(resolve => fs.read(fd, buf, 0, size, offset, resolve));
}

export async function invokeCallback(callback, ...args) {
    if (!callback)
        return;

    if (callback.constructor.name === 'AsyncFunction') {
        await callback(...args).catch(errHandler);
    }
    else {
        callback(...args);
    }
}

export function errHandler(err) {
    console.log(err);
}