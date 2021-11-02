const fs = require('fs');

export const controlMessages = {
    contractEnd: "contract_end",
    peerChangeset: "peer_changeset"
}
Object.freeze(controlMessages);

export const clientProtocols = {
    json: "json",
    bson: "bson"
}
Object.freeze(clientProtocols);

export const constants = {
    MAX_SEQ_PACKET_SIZE: 128 * 1024,
    PATCH_CONFIG_PATH: "../patch.cfg",
    POST_EXEC_SCRIPT_NAME: "post_exec.sh"
}
Object.freeze(constants);

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