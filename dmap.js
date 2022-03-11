module.exports = lib = {}

const multiformats = require('multiformats')
const prefLenIndex = 2
const hashLenIndex = 3
lib.FLAG_LOCK = 1 << 7

lib.chomp = (path) => {
    if (path.length == 0) throw new Error(`chomp: empty path`)
    const rune = path[0]
    const rest = path.slice(1)
    const re = /^[A-Za-z]+/
    const words = rest.match(re)
    //console.log('chomping', rune, rest, words)
    if (words.length == 0) throw new Error(`chomp: empty name after rune`)
    const name = words[0]
    const subpath = rest.slice(name.length)
    return [rune, name, subpath]
}

lib._walk = async (dmap, path, register, ctx, trace) => {
    //console.log(`walk ${path} ${register} ${ctx.locked}`)
    trace.push({ path, register, ctx })
    if (path.length == 0) {
        return trace
    }
    if (register == '0x' + '00'.repeat(32)) {
        throw new Error(`zero register`)
    }

    const [rune, name, rest] = lib.chomp(path)
    //console.log(`chomped ${rune} ${name} ${rest}`)
    const addr = '0x' + register.slice(2, 21 * 2) // 0x 00...
    const fullname = '0x' + Buffer.from(name).toString('hex') + '00'.repeat(32-name.length)
    //console.log('get', addr, fullname)
    const [meta, data] = await dmap.get(addr, fullname)
    const islocked = (Buffer.from(meta.slice(2), 'hex')[0] & lib.FLAG_LOCK) != 0
    //console.log('got', data, meta)
    if (rune == ':') {
        if (!ctx.locked) throw new Error(`Encountered ':' in unlocked subpath`)
        if (!islocked) throw new Error(`Entry is not locked`)
        return await lib._walk(dmap, rest, data, {locked:true}, trace)
    } else if (rune == '.') {
        return await lib._walk(dmap, rest, data, {locked:false}, trace)
    } else {
        throw new Error(`unrecognized rune`)
    }
    throw new Error(`panic: unreachable`)
}

lib.walk = async (dmap, path) => {
    const [, root] = await dmap.raw('0x' + '00'.repeat(32))
    const trace = await lib._walk(dmap, path, root, {locked:true}, [])
    return trace[trace.length-1].register
}

lib.prepareCID = (cidStr, lock) => {
    const cid = multiformats.CID.parse(cidStr)
    if (cid.multihash.size > 32) throw new Error(`Hash exceeds 256 bits`)
    const prefixLen = cid.byteLength - cid.multihash.size
    const meta = new Uint8Array(32).fill(0)
    const data = new Uint8Array(32).fill(0)

    data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    meta.set(cid.bytes.slice(0, prefixLen), 32 - prefixLen)
    if (lock) meta[0] |= lib.FLAG_LOCK
    meta[prefLenIndex] = prefixLen
    meta[hashLenIndex] = cid.multihash.size
    return [meta, data]
}

lib.unpackCID = (metaStr, dataStr) => {
    const data = Buffer.from(dataStr.slice(2), 'hex')
    const meta = Buffer.from(metaStr.slice(2), 'hex')
    const prefixLen = meta[prefLenIndex]
    const hashLen = meta[hashLenIndex]
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(-prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = multiformats.CID.decode(cidBytes)
    return cid.toString()
}
