const kek = require('js-sha3')

module.exports = {
    hexZeroPad,
    hexlify,
    keccak256
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
    // don't want to hash the prefix
    if (value.substring(0,2) == "0x") {
        value = value.substring(2)
    }
    // Need to create an array of bytes from hex string
    // just grab 2 4-byte hex symbols at a time and parse them as base16
    const bytes_array = []
    for (let i = 0; i < value.length; i+= 2) {
        bytes_array.push(parseInt(value.substring(i, i+2), 16));
        }
    return "0x" + kek.keccak256(new Uint8Array(bytes_array));
    }
    // add back in prefix and return as unsigned 1byte int array
    return "0x" + kek.keccak256(value);
}
