PUSH1 0x80
CALLVALUE
PUSH2 0x57
JUMPI
PUSH1 0x20
DUP2
ADD
PUSH1 0x1
PUSH1 0x1
PUSH1 0x40
SHL
SUB
DUP2
GT
DUP3
DUP3
LT
OR
PUSH2 0x5C
JUMPI
PUSH1 0x40
MSTORE
PUSH1 0x20
CODESIZE
PUSH1 0x1F
NOT
ADD
DUP3
CODECOPY
MLOAD
PUSH1 0x1
PUSH1 0x1
PUSH1 0xA0
SHL
SUB
DUP2
AND
DUP2
SUB
PUSH2 0x57
JUMPI
PUSH1 0x1
PUSH1 0xFF
SHL
PUSH1 0x0
SSTORE
PUSH1 0x60
SHL
PUSH1 0x1
SSTORE
PUSH1 0x40
MLOAD
PUSH2 0x73
SWAP1
DUP2
CODESIZE
SUB
DUP1
SWAP3
DUP3
CODECOPY
RETURN
JUMPDEST
PUSH1 0x0
DUP1
REVERT
JUMPDEST
PUSH4 0x4E487B71
PUSH1 0xE0
SHL
PUSH1 0x0
MSTORE
PUSH1 0x41
PUSH1 0x4
MSTORE
PUSH1 0x24
PUSH1 0x0
REVERT
INVALID
DEPLOY
// deployed code start
CALLDATASIZE
PUSH1 0x24
EQ
PUSH1 0x9D
// jump to pair block
JUMPI
// set block start
PUSH1 0x0
PUSH1 0x44
CALLDATALOAD
PUSH1 0x24
CALLDATALOAD
PUSH1 0x4
CALLDATALOAD
CALLER
PUSH1 0x00
MSTORE
DUP1
PUSH1 0x20
MSTORE
DUP2
PUSH1 0x40
PUSH1 0x00
KECCAK256
DUP5
DUP2
PUSH1 0x01
ADD
SSTORE
DUP1
SLOAD
PUSH32 0x8000000000000000000000000000000000000000000000000000000000000000
AND
ISZERO
CALLDATASIZE
PUSH1 0x64
EQ
AND
PUSH1 0x92
// jump to set return
JUMPI
CALLDATASIZE
PUSH1 0x64
EQ
PUSH1 0x62
// jump to lock fail block
JUMPI
POP
POP
POP
POP
POP
PUSH1 0x0
// bad calldata
REVERT
JUMPDEST
//lock fail block start
PUSH32 0xA4F0D7D000000000000000000000000000000000000000000000000000000000
PUSH1 0x00
MSTORE
POP
POP
POP
POP
POP
POP
PUSH1 0x04
PUSH1 0x00
REVERT
JUMPDEST
// set return
SSTORE
CALLER
PUSH1 0x00
PUSH1 0x00
LOG4
PUSH1 0x00
RETURN
JUMPDEST
// pair block start
PUSH1 0x1
PUSH1 0x4
CALLDATALOAD
DUP1
SLOAD
PUSH1 0x0
MSTORE
ADD
SLOAD
PUSH1 0x20
MSTORE
PUSH1 0x40
PUSH1 0x0
RETURN
INVALID
LOG2
PUSH5 0x6970667358
0x22
SLT
KECCAK256
SELFBALANCE
GAS
0x49
DIFFICULTY
0xD9
PUSH25 0xA2F0381A86377D6DFC867BB2A21DE12227434A9B06C9ED37CD
0x5F
PUSH5 0x736F6C6343
STOP
ADDMOD
0xD
STOP
CALLER
