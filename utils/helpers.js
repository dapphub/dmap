const chai = require('chai')
const want = chai.expect
function b32 (arg) {
    if (arg._isBigNumber) {
        const hex = arg.toHexString()
        const buff = Buffer.from(hex.slice(2), 'hex')
        const b32 = ethers.utils.zeroPad(buff, 32)
        return b32
    } else if (typeof (arg) === 'string') {
        const b32 = Buffer.from(arg + '\0'.repeat(32 - arg.length))
        return b32
    } else {
        throw new Error(`b32 takes a BigNumber or string, got ${arg}, a ${typeof (arg)}`)
    }
}

async function send (...args) {
    const f = args[0]
    const fargs = args.slice(1)
    const tx = await f(...fargs)
    return await tx.wait()
}

module.exports = {
    b32,
    send
}
