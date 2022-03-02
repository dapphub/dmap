module.exports = lib = {}

lib.chomp = (path) => {
    if (path.length == 0) throw new Error(`chomp: empty path`)
    const rune = path[0]
    const rest = path.slice(1)
    const re = /^[A-Za-z]+/
    const words = rest.match(re)
    console.log('chomping', rune, rest, words)
    if (words.length == 0) throw new Error(`chomp: empty key after rune`)
    const key = words[0]
    const subpath = rest.slice(key.length)
    return [rune, key, subpath]
}

lib._walk = async (dmap, path, register, ctx, trace) => {
    console.log(`walk ${path} ${register} ${ctx.locked}`)
    trace.push({ path, register, ctx })
    if (path.length == 0) {
        return [null, register, trace]
    }
    if (register == '0x' + '00'.repeat(32)) {
        return ['zero register', register, trace]
    }

    const [rune, key, rest] = lib.chomp(path)
    console.log(`chomped ${rune} ${key} ${rest}`)

    const addr = '0x' + register.slice(2, 21 * 2) // 0x 00...
    const fullkey = '0x' + Buffer.from(key).toString('hex') + '00'.repeat(32-key.length)
    console.log('get', addr, fullkey)

    const [value, flags] = await dmap.get(addr, fullkey)
    const islocked = BigInt(flags) % 2n == 1

    console.log(value, flags)
    console.log('islocked', islocked)

    if (rune == ':') {
        if (!ctx.locked) throw new Error(`Encountered ':' in unlocked subpath`)
        if (!islocked) throw new Error(`Entry is not locked`)
        return await lib._walk(dmap, rest, value, {locked:true}, trace)
    } else if (rune == '.') {
        return await lib._walk(dmap, rest, value, {locked:false}, trace)
    } else {
        return ['unrecognized rune', null, trace]
    }
    throw new Error(`panic: unreachable`)
}

lib.walk = async (dmap, path) => {
    const [root, ] = await dmap.raw('0x' + '00'.repeat(32))
    console.log('root', root)
    const [err, register, trace] = await lib._walk(dmap, path, root, {locked:true}, [])
    if (err) throw new Error(`FAIL WALK:\n${err}\n${JSON.stringify(trace,null,2)}`)
    return trace
}
