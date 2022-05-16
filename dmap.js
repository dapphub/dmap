const kek = require('js-sha3')
const ebnf = require('ebnf')

const pack = require('./pack/dmap.json')
const artifact = require('./pack/ipfs/Dmap.json')

const dmap_address = pack.objects.dmap.address

const fail =s=> { throw new Error(s) }
const need =(b,s)=> b || fail(s)

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
    const nextslot = hexZeroPad(
        hexlify(BigInt(slot) + BigInt(1)), 32
    )
    let meta, data
    await Promise.all(
        [
            dmap.provider.getStorageAt(dmap.address, slot),
            dmap.provider.getStorageAt(dmap.address, nextslot)
        ]
    ).then(res => [meta, data] = res)
    return [meta, data]
}

lib.getByZoneAndName = async (dmap, zone, name) => {
    const slot = keccak256(encodeZoneAndName(zone, name));
    return lib.get(dmap, slot)
}

lib.set = async (dmap, name, meta, data) => {
    const calldata = encodeFunctionCallBytes32Args("set(bytes32,bytes32,bytes32)", [name, meta, data])
    return dmap.signer.sendTransaction({to: dmap.address, data: calldata})
}

// const slotabi = ["function slot(bytes32 s) external view returns (bytes32)"]
// const slot_i = new ethers.utils.Interface(slotabi)
lib.slot = async (dmap, slot) => {
    const val = await dmap.provider.getStorageAt(dmap.address, slot)
    return val
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
        const fullname = '0x' + lib._strToHex(step.name) + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((lib._hexToArrayBuffer(meta)[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
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
        const fullname = '0x' + lib._strToHex(step.name) + '00'.repeat(32-step.name.length);
        [meta, data] = await lib.getByZoneAndName(dmap, zone, fullname)
        trace.push([meta,data])
        if (step.locked) {
            need(ctx.locked, `Encountered ':' in unlocked subpath`)
            need((lib._hexToArrayBuffer(meta)[31] & lib.FLAG_LOCK) !== 0, `Entry is not locked`)
            ctx.locked = true
        }
        ctx.locked = step.locked
    }
    return trace
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

// GLOBAL TODO: !DMFXYZ! error and bounds checking for inputs
const HexCharacters = "0123456789abcdef";

function hexZeroPad(value, length) {
    if (typeof(value) !== "string") {
        value = hexlify(value);
    }

    if (value.length > 2 * length + 2) {
        throw "Value too big"
    }

    while (value.length < 2 * length + 2) {
        value = "0x0" + value.substring(2);
    }

    return value;
}

function hexlify(value) {

    if (typeof(value) === "number") {
        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0xf] + hex;
            value = Math.floor(value / 16); // can bitshift instead
        }

        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }

        return "0x00";
    }

    if (typeof(value) === "bigint") {
        value = value.toString(16);
        if (value.length % 2) {
            return ("0x0" + value);
        }
        return "0x" + value;
    }

    if (typeof(value) === 'string') {
        return lib._strToHex(value);
    }
}

// Assumes value is a hex encoded string for now, or already a byte array
function keccak256(value) {

    if (typeof(value) == "string") {
        return "0x" + kek.keccak256(new Uint8Array(_toBytes(value)));
    }
    // add back in prefix and return as unsigned 1byte int array
    return "0x" + kek.keccak256(value);
}

function encodeZoneAndName(zone, name) {
    // zone should be an address, start by zero-padding 12 bytes
    let params = '0x' + '00'.repeat(12);
    if (zone.length == 0) {
        params = params + '00'.repeat(20);
    } else {
        params = params + zone.slice(2); // assume has leading 0x, prob shouldn't do this
    }
    if (name.length == 0 || name == null) {
        params = params + '00'.repeat(32);
    } else if (typeof(name) == 'object') {
        params = params + name.toString('hex');
    } else {
        // if already a hex string, just drop the 0x
        params = params + name.slice(2);
    }
    return params;
}

function encodeFunctionCallBytes32Args(signature, args) {
    // calculate function selector as first 4 bytes of hashed signature
    // keccak256 returns a string, so we take the first 10 characters
    let data = keccak256(signature).slice(0, 10)
    for (arg of args) {
        typeof arg == 'object' ? data += arg.toString('hex') : data += arg.slice(2)
    }
    return data;

}

function _toBytes(value) {
    if (typeof(value) == 'string') {
        return lib._hexToArrayBuffer(value)
    }
    return value
}
