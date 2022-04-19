const fs = require('fs')

const table = {
    STOP: 0,
    ADD: 1,
    MUL: 2,
    SUB: 3,
    DIV: 4,
    SDIV: 5,
    MOD: 6,
    SMOD: 7,
    ADDMOD: 8,
    MULMOD: 9,
    EXP: 10,
    SIGNEXTEND: 11,
    LT: 16,
    GT: 17,
    SLT: 18,
    SGT: 19,
    EQ: 20,
    ISZERO: 21,
    AND: 22,
    OR: 23,
    XOR: 24,
    NOT: 25,
    BYTE: 26,
    SHL: 27,
    SHR: 28,
    SAR: 29,
    KECCAK256: 32,
    ADDRESS: 48,
    BALANCE: 49,
    ORIGIN: 50,
    CALLER: 51,
    CALLVALUE: 52,
    CALLDATALOAD: 53,
    CALLDATASIZE: 54,
    CALLDATACOPY: 55,
    CODESIZE: 56,
    CODECOPY: 57,
    GASPRICE: 58,
    EXTCODESIZE: 59,
    EXTCODECOPY: 60,
    BLOCKHASH: 64,
    COINBASE: 65,
    TIMESTAMP: 66,
    NUMBER: 67,
    DIFFICULTY: 68,
    GASLIMIT: 69,
    CHAINID: 70,
    SELFBALANCE: 71,
    POP: 80,
    MLOAD: 81,
    MSTORE: 82,
    MSTORE8: 83,
    SLOAD: 84,
    SSTORE: 85,
    JUMP: 86,
    JUMPI: 87,
    PC: 88,
    MSIZE: 89,
    GAS: 90,
    JUMPDEST: 91,
    PUSH1: 96,
    PUSH2: 97,
    PUSH3: 98,
    PUSH4: 99,
    PUSH5: 100,
    PUSH6: 101,
    PUSH7: 102,
    PUSH8: 103,
    PUSH9: 104,
    PUSH10: 105,
    PUSH11: 106,
    PUSH12: 107,
    PUSH13: 108,
    PUSH14: 109,
    PUSH15: 110,
    PUSH16: 111,
    PUSH17: 112,
    PUSH18: 113,
    PUSH19: 114,
    PUSH20: 115,
    PUSH21: 116,
    PUSH22: 117,
    PUSH23: 118,
    PUSH24: 119,
    PUSH25: 120,
    PUSH26: 121,
    PUSH27: 122,
    PUSH28: 123,
    PUSH29: 124,
    PUSH30: 125,
    PUSH31: 126,
    PUSH32: 127,
    DUP1: 128,
    DUP2: 129,
    DUP3: 130,
    DUP4: 131,
    DUP5: 132,
    DUP6: 133,
    DUP7: 134,
    DUP8: 135,
    DUP9: 136,
    DUP10: 137,
    DUP11: 138,
    DUP12: 139,
    DUP13: 140,
    DUP14: 141,
    DUP15: 142,
    DUP16: 143,
    SWAP1: 144,
    SWAP2: 145,
    SWAP3: 146,
    SWAP4: 147,
    SWAP5: 148,
    SWAP6: 149,
    SWAP7: 150,
    SWAP8: 151,
    SWAP9: 152,
    SWAP10: 153,
    SWAP11: 154,
    SWAP12: 155,
    SWAP13: 156,
    SWAP14: 157,
    SWAP15: 158,
    SWAP16: 159,
    LOG0: 160,
    LOG1: 161,
    LOG2: 162,
    LOG3: 163,
    LOG4: 164,
    CREATE: 240,
    CALL: 241,
    CALLCODE: 242,
    RETURN: 243,
    DELEGATECALL: 244,
    REVERT: 253,
    INVALID: 254,
    SELFDESTRUCT: 255
}

const assert = require('assert')
const hexZeroPad = require('ethers').utils.hexZeroPad
const fmt = (n, size) => {
    if (typeof(n) == 'string') {
        const str = n.slice(0, 2) != '0x' ? '0x' + n : n
        return hexZeroPad(str, size).slice(2)
    }
    else if (typeof(n) == 'number') {
        return hexZeroPad(n, size).slice(2)
    }
}

function parseasm(path) {
    let deploying = false
    const lines = fs.readFileSync(path).toString().split('\n')
    let bytecode = ''
    let deployedbytecode = ''
    const addCode = (s) => {
        bytecode += s
        if (deploying) deployedbytecode += s
    }
    lines.filter(x => x != '').forEach(l => {
        const splits = l.split(' ')
        for (let i = 0; i < splits.length; i++) {
            const s = splits[i]
            if (!deploying && s == 'DEPLOY') {
                deploying = true
                continue
            }
            if (s.slice(0, 4) == 'PUSH') {
                let paddedOpc = fmt(table[s], 1)
                addCode(paddedOpc)
                const size = Number(s.slice(4, 6))
                const paddedLit = fmt(splits[i + 1], size)
                addCode(paddedLit)
                i++
                continue
            }
            if (!isNaN(Number(s))) {
                const padded = fmt(s, Math.ceil(s.length / 2 - 1))
                addCode(padded)
            } else {
                const word = table[s]
                assert(word != undefined)
                let expanded = Number(word).toString(16)
                if (expanded.length % 2 == 1) expanded = '0' + expanded
                assert(expanded.length % 2 == 0)
                addCode(expanded)
            }
        }
    })
    return [String(bytecode).toLowerCase(), String(deployedbytecode).toLowerCase()]
}

module.exports = {parseasm}