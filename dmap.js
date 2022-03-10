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
    if (words.length == 0) throw new Error(`chomp: empty key after rune`)
    const key = words[0]
    const subpath = rest.slice(key.length)
    return [rune, key, subpath]
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

    const [rune, key, rest] = lib.chomp(path)
    //console.log(`chomped ${rune} ${key} ${rest}`)
    const addr = '0x' + register.slice(2, 21 * 2) // 0x 00...
    const fullkey = '0x' + Buffer.from(key).toString('hex') + '00'.repeat(32-key.length)
    //console.log('get', addr, fullkey)
    const [flags, value] = await dmap.get(addr, fullkey)
    const islocked = (Buffer.from(flags.slice(2), 'hex')[0] & lib.FLAG_LOCK) != 0
    //console.log('got', value, flags)
    if (rune == ':') {
        if (!ctx.locked) throw new Error(`Encountered ':' in unlocked subpath`)
        if (!islocked) throw new Error(`Entry is not locked`)
        return await lib._walk(dmap, rest, value, {locked:true}, trace)
    } else if (rune == '.') {
        return await lib._walk(dmap, rest, value, {locked:false}, trace)
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
    const flags = new Uint8Array(32).fill(0)
    const value = new Uint8Array(32).fill(0)

    value.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    flags.set(cid.bytes.slice(0, prefixLen), 32 - prefixLen)
    if (lock) flags[0] |= lib.FLAG_LOCK
    flags[prefLenIndex] = prefixLen
    flags[hashLenIndex] = cid.multihash.size
    return [flags, value]
}

lib.unpackCID = (flagsStr, valueStr) => {
    const value = Buffer.from(valueStr.slice(2), 'hex')
    const flags = Buffer.from(flagsStr.slice(2), 'hex')
    const prefixLen = flags[prefLenIndex]
    const hashLen = flags[hashLenIndex]
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(flags.slice(-prefixLen), 0)
    cidBytes.set(value.slice(32 - hashLen), prefixLen)
    const cid = multiformats.CID.decode(cidBytes)
    return cid.toString()
}
