const { nameprep } = require('ethers/lib/utils');
const kek = require('js-sha3')

module.exports = {
    hexZeroPad,
    hexlify,
    keccak256,
    encodeZoneAndName,
    encodeFunctionCallBytes32Args
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
            if (hex.length % 2) { hex = "0" + hex; }
            return "0x" + hex;
        }

        return "0x00";
    }

    if (typeof(value) === "bigint") {
        value = value.toString(16);
        if (value.length % 2) { return ("0x0" + value); }
        return "0x" + value;
    }

    if (typeof(value) === 'string') {
        return new Buffer(value).toString('hex');
    }
}

// Assumes value is a hex encoded string for now
function keccak256(value, to_string=false) {

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
        // if an object, create a buffer from data and encode as hex string
        params = params + Buffer.from(name).toString('hex');
    } else {
        // if alredy a hex string, just drop the 0x
        params = params + name.slice(2);
    }
    return params;
}

function encodeFunctionCallBytes32Args(signature, args) {
    const signature_as_buffer = Buffer.from(signature)
    // calculate function selector as first 4 bytes of hashed signature
    const selector = keccak256(signature_as_buffer).slice(0,10).toString('hex')
    let calldata = selector
    for (i = 0; i < args.length; ++i) {
        calldata += Buffer.from(_toBytes(args[i])).toString('hex');
    }
    return calldata;

}

function _toBytes(value){
    if (typeof(value) == 'string') {
        if (value.substring(0,2) == "0x") {
        value = value.substring(2)
     }
        // Need to create an array of bytes from hex string
        // just grab 2 4-byte hex symbols at a time and parse them as base16
        const bytes_array = []
        for (let i = 0; i < value.length; i+= 2) {
            bytes_array.push(parseInt(value.substring(i, i+2), 16));
            }
        return bytes_array
    }
    // otherwise just return the object
    return value
}