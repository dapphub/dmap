const ebnf = require('ebnf')
const multiformats = require('multiformats')
const prefLenIndex = 2
const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)
const text = 0
const children = 1

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
    return flat[1]
}
lib.postparse =ast=> [ast.text, ast.children.map(lib.postparse)]
lib.locked =meta=> (Buffer.from(meta.slice(2), 'hex')[0] & lib.FLAG_LOCK) !== 0

lib._walk = async (dmap, path, register, reg_meta, trace) => {
    trace.push({ path, register, reg_meta })
    if (path.length == 0) {
        return trace
    }
    if (register == '0x' + '00'.repeat(32)) {
        fail(`zero register`)
    }

    const step = path[0]
    const rune = step[children][0][text]
    const name = step[children][1][text]
    rest = path.slice(1)
    const addr = register.slice(0, 21 * 2)
    const fullname = '0x' + Buffer.from(name).toString('hex') + '00'.repeat(32-name.length)
    const [meta, data] = await dmap.get(addr, fullname)
    const islocked = lib.locked(meta)
    if (rune == ':') {
        need(islocked, `Entry is not locked`)
        return await lib._walk(dmap, rest, data, meta, trace)
    } else if (rune == '.') {
        return await lib._walk(dmap, rest, data, meta, trace)
    } else {
        fail(`unrecognized rune: ${rune}`)
    }
    fail(`panic: unreachable`)
}

lib._slot = async (dmap, key) => {
    need(dmap.provider, `walk: no provider on given dmap object`)
    return await dmap.provider.getStorageAt(dmap.address, key)
}

lib.walk = async (dmap, path) => {
    if (![':', '.'].includes(path.charAt(0))) {
        path = ':' + path
    }
    if (path.includes('.')) {
        need(path.lastIndexOf(":") < path.indexOf("."), `Encountered ':' in unlocked subpath`)
    }

    const root = await lib._slot(dmap, '0x' + '00'.repeat(32))
    const meta = await lib._slot(dmap, '0x' + '00'.repeat(31)) + '01'
    const ast = lib.parse(path)
    const trace = await lib._walk(dmap, ast, root, meta, [])
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
    const data = Buffer.from(dataStr.slice(2), 'hex')
    const meta = Buffer.from(metaStr.slice(2), 'hex')
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
