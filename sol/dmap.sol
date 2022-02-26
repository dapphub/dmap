/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.10;

contract Dmap {
    // storage: hash(zone, key) -> (val, flags)
    // flags: locked (2^2) & dir (2^1)
    // log4: zone, key, val, flags
    // err: "LOCK"

    constructor(address rootzone) {
        assembly {
            sstore(0, rootzone)
            sstore(0, 3) // locked & dir
        }
    }

    function raw(bytes32 slot) payable external
      returns (bytes32 val, bytes32 flags) {
        assembly {
            val := sload(slot)
            flags := sload(add(slot, 1))
        }
    }

    function get(address zone, bytes32 key) payable external
      returns (bytes32 value, bytes flags) {
        bytes32 hkey = keccak256(abi.encode(zone, key));
        bytes32 flags;
        assembly {
            value := sload(hkey)
            flags := sload(add(hkey, 1))
        }
    }

    function set(bytes32 key, bytes32 val, bytes32 flags) payable external {
        bytes32 hkey = keccak256(abi.encode(caller(), key));
        bytes32 prior;
        assembly {
            prior := sload(add(hkey, 1))
            if eq(2, and(prior, 2)) { revert("LOCK", 4) }
            sstore(hkey, val)
            sstore(add(hkey, 1), flags)
            log4(caller(), key, val, flags, 0, 0)
        }
    }
}