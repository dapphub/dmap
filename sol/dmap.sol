/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.13;

contract Dmap {
    bytes32 constant FLAG_LOCK = 0x8000000000000000000000000000000000000000000000000000000000000000;
    bytes4  constant SIG_LOCK  = 0xa4f0d7d0; // LOCK()
    error            LOCK();  // export in ABI

    constructor(address rootzone) {
        assembly {
            sstore(0, FLAG_LOCK)
            sstore(1, shl(96, rootzone))
        }
    }

    function get(address zone, bytes32 name) external view
      returns (bytes32 meta, bytes32 data) {
        assembly {
            calldatacopy(0, 4, 64)
            let slot := keccak256(0, 64)
            mstore(0, sload(slot))
            mstore(32, sload(add(slot, 1)))
            return(0, 64)
        }
    }

    function set(bytes32 name, bytes32 meta, bytes32 data) external {
        assembly {
            mstore(0, caller())
            mstore(32, name)
            log4(0, 0, caller(), name, meta, data)
            let slot0 := keccak256(0, 64)
            sstore(add(slot0, 1), data)
            if iszero(and(FLAG_LOCK, sload(slot0))) {
                sstore(slot0, meta)
                return(0, 0)
            }
            mstore(0, SIG_LOCK)
            revert(0, 4)
        }
    }

}
