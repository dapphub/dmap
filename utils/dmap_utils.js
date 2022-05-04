module.exports = {
    hexZeroPad,
    hexlify
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
}