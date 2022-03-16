/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.11;

contract Dmap {
    bytes32 constant FLAG_LOCK = 0x8000000000000000000000000000000000000000000000000000000000000000;
    bytes4  constant SIG_LOCK  = 0xa4f0d7d0; // LOCK()
    error            LOCK();  // export in ABI

    constructor(address rootzone) {
        assembly {
            sstore(0, shl(96, rootzone))
            sstore(1, FLAG_LOCK)
        }
    }

    function get(address zone, bytes32 name) external view
      returns (bytes32 meta, bytes32 data) {
        assembly {
            mstore(0, zone)
            mstore(32, name)
            let slot := keccak256(0, 64)
            meta := sload(add(slot, 1))
            data := sload(slot)
        }
    }

    function set(bytes32 name, bytes32 meta, bytes32 data) external {
        assembly {
            log4(0, 0, caller(), name, meta, data)
            mstore(32, name)
            mstore(0, caller())
            let slot0 := keccak256(0, 64)
            let slot1 := add(slot0, 1)
            if iszero(and(FLAG_LOCK, sload(slot1))) {
                sstore(slot0, data)
                sstore(slot1, meta)
                return(0, 0)
            }
            mstore(0, SIG_LOCK)
            revert(0, 4)
        }
    }

}
