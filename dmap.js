const ebnf = require('ebnf')
const ethers = require('ethers')

const pack = require('./pack/dmap.json')
const artifact = require('./pack/ipfs/Dmap.json')

const dmap_utils = require("./utils/dmap_utils.js")

const abi    = artifact.abi
const dmap_i = new ethers.utils.Interface(abi)
const dmap_address = pack.objects.dmap.address

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

const coder = ethers.utils.defaultAbiCoder
const keccak256 = ethers.utils.keccak256

module.exports = lib = {}

lib.address = dmap_address
lib.artifact = artifact

lib.FLAG_LOCK = 1
lib.grammar = `
dpath ::= (step)* EOF
step  ::= (rune) (name)
name  ::= [a-z0-9]+
rune  ::= ":" | "."
`

lib.parser = new ebnf.Parser(ebnf.Grammars.W3C.getRules(lib.grammar))
lib.parse =s=> {
    const ast = lib.parser.getAST(s)
    return ast.children.map(step => {
        const rune = step.children[0]
        const name = step.children[1]
        return {
            locked: rune.text === ":",
            name:   name.text
        }
    })
}

lib.get = async (dmap, slot) => {
    const nextslot = dmap_utils.hexZeroPad(
        dmap_utils.hexlify(BigInt(slot) + BigInt(1)), 32
    )
    let meta, data
    await Promise.all(
        [
            dmap.provider.getStorageAt(dmap.address, slot),
            dmap.provider.getStorageAt(dmap.address, nextslot)
        ]
    ).then(res => [meta, data] = res)
    const resdata = dmap_i.encodeFunctionResult("get", [meta, data])
    const res = dmap_i.decodeFunctionResult("get", resdata)
    return res
}

lib.getByZoneAndName = async (dmap, zone, name) => {
    const slot = keccak256(coder.encode(["address", "bytes32"], [zone, name]))
    return lib.get(dmap, slot)
}

lib.set = async (dmap, name, meta, data) => {
    const calldata = dmap_i.encodeFunctionData("set", [name, meta, data])
    return dmap.signer.sendTransaction({to: dmap.address, data: calldata})
}

const slotabi = ["function slot(bytes32 s) external view returns (bytes32)"]
const slot_i = new ethers.utils.Interface(slotabi)
lib.slot = async (dmap, slot) => {
    const val = await dmap.provider.getStorageAt(dmap.address, slot)
    const resdata = slot_i.encodeFunctionResult("slot", [val])
    const res = slot_i.decodeFunctionResult("slot", resdata)
    return res[0]
}


lib.walk = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) path = ':' + path
    let [meta, data] = await lib.get(dmap, '0x' + '00'.repeat(32))
    let ctx = {locked: path.charAt(0) === ':'}
    for (const step of lib.parse(path)) {
        zone = data.slice(0, 21 * 2)
        if (zone === '0x' + '00'.repeat(20)) {
            fail(`zero register`)
        }
        const fullname = '0x' + Buffer.from(step.name).toString('hex') + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((Buffer.from(meta.slice(2), 'hex')[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return {meta, data}
}

lib.walk2 = async (dmap, path) => {
    if ( path.length > 0 && ![':', '.'].includes(path.charAt(0))) path = ':' + path
    let [meta, data] = await lib.get(dmap, '0x' + '00'.repeat(32))
    let ctx = {locked: path.charAt(0) === ':'}
    const trace = [[meta,data]]
    for (const step of lib.parse(path)) {
        zone = data.slice(0, 21 * 2)
        if (zone === '0x' + '00'.repeat(20)) {
            fail(`zero register`)
        }
        const fullname = '0x' + Buffer.from(step.name).toString('hex') + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        trace.push([meta,data])
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((Buffer.from(meta.slice(2), 'hex')[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return trace
}
