module.exports = lib = {}

lib.chomp = (path) => {
    if (path.length == 0) throw new Error(`chomp: empty path`)
    const rune = path[0]
    const rest = path.slice(1)
    const re = /^[A-Za-z]/
    const words = rest.match(re)
    if (words.length == 0) throw new Error(`chomp: empty key after rune`)
    const key = words[0]
    const subpath = rest.slice(key.length)
    return [rune, key, subpath]
}

lib._walk = async (dmap, path, register, ctx, trace) => {
    trace.push({ path, register, ctx })
    if (path.length == 0) {
        return [null, register, trace]
    }
    const [rune, key, rest] = lib.chomp(path)
    if (rune == ':') {
        const [value, flags] = await dmap.get(register, key)
        if (!ctx.locked) throw new Error(`Encountered ':' in unlocked subpath`)
        if (!lockflag(flags)) throw new Error(`Entry is not locked`)
        return await lib._walk(dmap, rest, value, {locked:true}, trace)
    } else if (rune == '.') {
        const [value, flags] = await dmap.get(register, key)
        return await lib._walk(dmap, rest, value, {locked:false}, trace)
    } else {
        return ['unrecognized rune', null, trace]
    }
    throw new Error(`panic: unreachable`)
}

lib.walk = async (dmap, path) => {
    const [root, ] = await dmap.raw('0x' + '00'.repeat(32))
    return await lib._walk(dmap, path, root, {locked:true}, [])
}
