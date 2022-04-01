const ebnf = require('ebnf')
const multiformats = require('multiformats')
const prefLenIndex = 2
const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

module.exports = lib = {}

lib.FLAG_LOCK = 1 << 7
lib.grammar = `
dpath ::= (step)* EOF
step  ::= (rune) (name)
name  ::= [a-z0-9]+
rune  ::= ":" | "."
`
lib.parser = new ebnf.Parser(ebnf.Grammars.W3C.getRules(lib.grammar))
lib.parse =s=> {
    const ast = lib.parser.getAST(s)
    const flat = lib.postparse(ast)
    return flat[0]
}
lib.postparse =ast=> [ast.children.map(step => ({locked: step.children.find(({ type }) => type === 'rune').text === ":",
                                                 name:   step.children.find(({ type }) => type === 'name').text}))]

lib._walk = async (dmap, path, register, reg_meta, ctx, trace) => {
    trace.push({ path, register, reg_meta, ctx })
    if (path.length == 0) {
        return trace
    }
    if (register == '0x' + '00'.repeat(32)) {
        fail(`zero register`)
    }

    const step = path[0]
    rest = path.slice(1)
    const addr = register.slice(0, 21 * 2)
    const fullname = '0x' + lib.strToHex(step.name) + '00'.repeat(32-step.name.length)
    const [meta, data] = await dmap.get(addr, fullname)
    if (step.locked) {
        need(ctx.locked, `Encountered ':' in unlocked subpath`)
        need((lib.hexToArrayBuffer(meta.slice(2))[0] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
        return await lib._walk(dmap, rest, data, meta, {locked:true}, trace)
    } else {
        return await lib._walk(dmap, rest, data, meta, {locked:false}, trace)
    }
}

lib._slot = async (dmap, key) => {
    need(dmap.provider, `walk: no provider on given dmap object`)
    return await dmap.provider.getStorageAt(dmap.address, key)
}

lib.strToHex = str => {
    let codes =  str.split('').map(c => c.charCodeAt(0))
    return codes.map(c => c.toString(16)).join('')
}

lib.hexToArrayBuffer = hex => {
    const bytes = []
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.slice(c, c + 2), 16))
    return new Uint8Array(bytes)
}

lib.walk = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) {
        path = ':' + path
    }
    const meta = await lib._slot(dmap, '0x' + '00'.repeat(32))
    const root = await lib._slot(dmap, '0x' + '00'.repeat(31) + '01')
    const steps = lib.parse(path)
    const trace = await lib._walk(dmap, steps, root, meta, {locked: path.charAt(0) === ':'}, [])
    return {'meta': trace[trace.length-1].reg_meta, 'data': trace[trace.length-1].register}
}

lib.prepareCID = (cidStr, lock) => {
    const cid = multiformats.CID.parse(cidStr)
    need(cid.multihash.size <= 32, `Hash exceeds 256 bits`)
    const prefixLen = cid.byteLength - cid.multihash.size
    const meta = new Uint8Array(32).fill(0)
    const data = new Uint8Array(32).fill(0)

    data.set(cid.bytes.slice(-cid.multihash.size), 32 - cid.multihash.size)
    meta.set(cid.bytes.slice(0, prefixLen), 32 - prefixLen)
    if (lock) meta[0] |= lib.FLAG_LOCK
    meta[prefLenIndex] = prefixLen
    return [meta, data]
}

lib.unpackCID = (metaStr, dataStr) => {
    const meta = lib.hexToArrayBuffer(metaStr.slice(2))
    const data = lib.hexToArrayBuffer(dataStr.slice(2))
    const prefixLen = meta[prefLenIndex]
    const specs = multiformats.CID.inspectBytes(meta.slice(-prefixLen));
    const hashLen = specs.digestSize
    const cidBytes = new Uint8Array(prefixLen + hashLen)

    cidBytes.set(meta.slice(-prefixLen), 0)
    cidBytes.set(data.slice(32 - hashLen), prefixLen)
    const cid = multiformats.CID.decode(cidBytes)
    return cid.toString()
}

lib.readCID = async (dmap, path) => {
    const packed = await lib.walk(dmap, path)
    return lib.unpackCID(packed.meta, packed.data)
}
