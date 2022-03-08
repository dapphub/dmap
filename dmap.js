module.exports = lib = {}

const multiformats = require('multiformats')

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
    const [value, flags] = await dmap.get(addr, fullkey)
    const islocked = BigInt(flags) % 2n == 1
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
    const [root, ] = await dmap.raw('0x' + '00'.repeat(32))
    const trace = await lib._walk(dmap, path, root, {locked:true}, [])
    return trace[trace.length-1].register
}

lib.prepareCID = (_cid, lock) => {
    const cid = multiformats.CID.parse(_cid)
    if (cid.multihash.size != 32) throw new Error(`Unsupported multihash code`)
    if (cid.version != 1) throw new Error(`Unsupported CID version`)
    let flags = new Array(32).fill(0);
    flags[0] = cid.code
    flags[1] = cid.multihash.code
    if (lock) flags[31] = 1
    return [cid.multihash.digest, flags]
}

lib.unpackCID = (value, flags) => {
    const cidCode = Buffer.from(flags.slice(2), 'hex')[0]
    const hashCode = Buffer.from(flags.slice(2), 'hex')[1]
    const digest = multiformats.digest.create(hashCode, Buffer.from(value.slice(2), "hex"))
    const cid = multiformats.CID.createV1(cidCode, digest)
    return cid.toString()
}
