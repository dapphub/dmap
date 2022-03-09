/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.11;

contract Dmap {
    // storage: hash(zone, name) -> (meta, data)
    // flags: locked (2^0) & appflags
    // log4: zone, key, value, flags
    // err: "LOCK"

    bytes32 immutable FLAG_LOCK = bytes32(uint256(1 << 255));

    constructor(address rootzone) {
        bytes32 LOCK = FLAG_LOCK;
        assembly {
            sstore(0, shl(96, rootzone))
            sstore(1, LOCK)
        }
    }

    function raw(bytes32 slot) external view
      returns (bytes32 meta, bytes32 data) {
        assembly {
            meta := sload(add(slot, 1))
            data := sload(slot)
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
        bytes32 LOCK = FLAG_LOCK;
        assembly {
            log4(0, 0, caller(), name, data, meta)
            mstore(32, name)
            mstore(0, caller())
            let slot0 := keccak256(0, 64)
            let slot1 := add(slot0, 1)
            if and(LOCK, sload(slot1)) {
                mstore(0, "LOCK")
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
