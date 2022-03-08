module.exports = lib = {}

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
    const cid = Buffer.from(_cid)
    const numBytes = cid.byteLength
    if (numBytes >= 64 || numBytes <= 33) throw new Error(`Unsupported CID length.`)
    const hashStart = numBytes - 32
    const hash = cid.slice(hashStart)
    let flags = new Array(32).fill(0);
    flags.splice(0, hashStart, ...cid.slice(0, hashStart))
    if (lock) flags[31] = 1
    return [hash, flags]
}

lib.unpackCID = (value, flags) => {
    const valueBuffer = Buffer.from(value.slice(2), "hex")
    const flagsBuffer = Buffer.from(flags.slice(2), "hex")
    let terminator = flagsBuffer.findIndex(char => char === 0);
    if (terminator === -1) terminator = 31
    const prefix = flagsBuffer.slice(0, terminator)
    const cidBuf = Buffer.concat([prefix, valueBuffer])
    return cidBuf.toString()
}
