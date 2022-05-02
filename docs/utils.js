const multiformats = require('multiformats')
const lib = require('../dmap.js')

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

const prefLenIndex = 30

module.exports = utils = {}

utils.prepareCID = (cidStr, lock) => {
    const cid = multiformats.CID.parse(cidStr)
    need(cid.multihash.size <= 32, `Hash exceeds 256 bits`)
    const prefixLen = cid.byteLength - cid.multihash.size
    const meta = new Uint8Array(32).fill(0)
    const data = new Uint8Array(32).fill(0)

    data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    meta.set(cid.bytes.slice(0, prefixLen))
    if (lock) meta[31] |= lib.FLAG_LOCK
    meta[prefLenIndex] = prefixLen
    return [meta, data]
}

utils.unpackCID = (metaStr, dataStr) => {
    const meta = Buffer.from(metaStr.slice(2), 'hex')
    const data = Buffer.from(dataStr.slice(2), 'hex')
    const prefixLen = meta[prefLenIndex]
    const specs = multiformats.CID.inspectBytes(meta.slice(0, prefixLen))
    const hashLen = specs.digestSize
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(0, prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = multiformats.CID.decode(cidBytes)
    return cid.toString()
}

utils.readCID = async (dmap, path) => {
    const packed = await lib.walk(dmap, path)
    return utils.unpackCID(packed.meta, packed.data)
}