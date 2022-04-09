const ebnf = require('ebnf')
const multiformats = require('multiformats')
const {ethers} = require('ethers');
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
    return lib.postparse(ast)
}
lib.postparse =ast=> ast.children.map(step => ({locked: step.children.find(({ type }) => type === 'rune').text === ":",
                                                name:   step.children.find(({ type }) => type === 'name').text}))

lib.get = async (dmap, zone, name) => {
    const slot = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [zone, name])
    )
    return dmap.pair(slot)
}

lib.walk = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) path = ':' + path
    let [meta, data] = await dmap.pair('0x' + '00'.repeat(32))
    let ctx = {locked: path.charAt(0) === ':'}
    for (const step of lib.parse(path)) {
        zone = data.slice(0, 21 * 2)
        if (zone === '0x' + '00'.repeat(20)) {
            fail(`zero register`)
        }
        const fullname = '0x' + lib._strToHex(step.name) + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.get(dmap, zone, fullname)
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((lib._hexToArrayBuffer(meta)[0] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return {meta, data}
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
    const meta = lib._hexToArrayBuffer(metaStr)
    const data = lib._hexToArrayBuffer(dataStr)
    const prefixLen = meta[prefLenIndex]
    const specs = multiformats.CID.inspectBytes(meta.slice(-prefixLen))
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

lib._hexToArrayBuffer = hex => {
    const bytes = []
    for (let c = 2; c < hex.length; c += 2)
        bytes.push(parseInt(hex.slice(c, c + 2), 16))
    return new Uint8Array(bytes)
}

lib._strToHex = str => {
    let codes =  str.split('').map(c => c.charCodeAt(0))
    return codes.map(c => c.toString(16)).join('')
}
