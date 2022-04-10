const ebnf = require('ebnf')
const multiformats = require('multiformats')
const prefLenIndex = 2
const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)
const ethers = require('ethers')
const {b32} = require("minihat");
const coder = ethers.utils.defaultAbiCoder
const keccak256 = ethers.utils.keccak256


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

// doesn't match DmapI, just for parsing arguments and results
const abi = [
    "function get(address, bytes32) returns (bytes32 meta, bytes32 data)",
    "function set(bytes32, bytes32, bytes32)",
    "function slot(bytes32) returns (bytes32)",
]
const iface = new ethers.utils.Interface(abi)

lib.get = async (dmap, zone, name) => {
    const slot = keccak256(coder.encode(["address", "bytes32"], [zone, name]))
    const meta = await dmap.provider.getStorageAt(dmap.address, slot)
    const nextslot = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(slot).add(1).toHexString(), 32
    )
    const data = await dmap.provider.getStorageAt(dmap.address, nextslot)
    const resdata = iface.encodeFunctionResult("get", [meta, data])
    const res = iface.decodeFunctionResult("get", resdata)
    return res
}


lib.set = async (dmap, name, meta, data) => {
    const calldata = iface.encodeFunctionData("set", [name, meta, data])
    return dmap.signer.sendTransaction({to: dmap.address, data: calldata})
}

lib.slot = async (dmap, slot) => {
    const val = await dmap.provider.getStorageAt(dmap.address, slot)
    const resdata = iface.encodeFunctionResult("slot", [val])
    const res = iface.decodeFunctionResult("slot", resdata)
    return res[0]
}

lib.pair = async (dmap, slot) => {
    const meta = await dmap.provider.getStorageAt(dmap.address, slot)
    const nextslot = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(slot).add(1).toHexString(), 32
    )
    const data = await dmap.provider.getStorageAt(dmap.address, nextslot)
    const resdata = iface.encodeFunctionResult("get", [meta, data])
    const res = iface.decodeFunctionResult("get", resdata)
    return res
}

lib.postparse =ast=> ast.children.map(step => ({locked: step.children.find(({ type }) => type === 'rune').text === ":",
                                                name:   step.children.find(({ type }) => type === 'name').text}))

lib.walk = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) path = ':' + path
    let [meta, data] = await lib.pair(dmap, '0x' + '00'.repeat(32))
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
