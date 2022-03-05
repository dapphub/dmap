/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.11;

contract Dmap {
    // storage: hash(zone, key) -> (value, flags)
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
      returns (bytes32 value, bytes32 flags) {
        assembly {
            flags := sload(add(slot, 1))
            value := sload(slot)
        }
    }

    function get(address zone, bytes32 key) external view
      returns (bytes32 value, bytes32 flags) {
        assembly {
            mstore(0, zone)
            mstore(32, key)
            let slot := keccak256(0, 64)
            flags := sload(add(slot, 1))
            value := sload(slot)
        }
    }

    function set(bytes32 key, bytes32 value, bytes32 flags) external {
        bool rev;
        assembly {
            log4(0, 0, caller(), key, value, flags)
            mstore(32, key)
            mstore(0, caller())
            let slot0 := keccak256(0, 64)
            let slot1 := add(slot0, 1)
            rev := and(1, sload(slot1))
            sstore(slot0, value)
            sstore(slot1, flags)
        }
        require(!rev, 'LOCK');
    }

    function slot(address zone, bytes32 key) external pure returns (bytes32 slot) {
        assembly {
            mstore(0, zone)
            mstore(32, key)
            slot := keccak256(0, 64)
        }
    }

}
