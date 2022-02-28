/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.10;

contract Dmap {
    // storage: hash(zone, key) -> (val, flags)
    // flags: locked (2^1) & dir (2^0)
    // log4: zone, key, val, flags
    // err: "LOCK"

    constructor(address rootzone) {
        assembly {
            sstore(0, rootzone)
            sstore(1, 3) // locked & dir
        }
    }

    function raw(bytes32 slot) payable external
      returns (bytes32 value, bytes32 flags) {
        assembly {
            value := sload(slot)
            flags := sload(add(slot, 1))
        }
    }

    function get(address zone, bytes32 key) payable external
      returns (bytes32 value, bytes flags) {
        bytes32 hkey = keccak256(abi.encode(zone, key));
        assembly {
            value := sload(hkey)
            flags := sload(add(hkey, 1))
        }
    }

    function set(bytes32 key, bytes32 value, bytes32 flags) payable external {
        bytes32 hkey = keccak256(abi.encode(caller(), key));
        bytes32 prior;
        assembly {
            prior := sload(add(hkey, 1))
            if eq(2, and(prior, 2)) { revert("LOCK", 4) }
            sstore(hkey, value)
            sstore(add(hkey, 1), flags)
            log4(caller(), key, value, flags, 0, 0)
        }
    }
}