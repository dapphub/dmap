/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.11;

contract Dmap {
    // storage: hash(zone, name) -> (data, meta)
    // flags: locked (2^0) & appflags
    // log4: zone, key, value, flags
    // err: "LOCK"

    constructor(address rootzone) {
        assembly {
            sstore(0, shl(96, rootzone))
            sstore(1, 3) // locked & 2^1
        }
    }

    function raw(bytes32 slot) external view
      returns (bytes32 data, bytes32 meta) {
        assembly {
            meta := sload(add(slot, 1))
            data := sload(slot)
        }
    }

    function get(address zone, bytes32 name) external view
      returns (bytes32 data, bytes32 meta) {
        assembly {
            mstore(0, zone)
            mstore(32, name)
            let slot := keccak256(0, 64)
            meta := sload(add(slot, 1))
            data := sload(slot)
        }
    }

    error LOCK();
    bytes4 constant locksel = 0xa4f0d7d0; // keccak256("LOCK()")
    function set(bytes32 name, bytes32 data, bytes32 meta) external {
        assembly {
            log4(0, 0, caller(), name, data, meta)
            mstore(32, name)
            mstore(0, caller())
            let slot0 := keccak256(0, 64)
            let slot1 := add(slot0, 1)
            if and(1, sload(slot1)) {
                mstore(0, locksel)
                revert(0, 4)
            }
            sstore(slot0, data)
            sstore(slot1, meta)
        }
    }

    function slot(address zone, bytes32 name) external pure returns (bytes32 slot) {
        assembly {
            mstore(0, zone)
            mstore(32, name)
            slot := keccak256(0, 64)
        }
    }

}
