/// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.10;

contract Dmap {
    // storage: hash(zone, key) -> (val, flags)
    // flags: locked (2^2) & dir (2^1)
    // log4: zone, key, val, flags
    // err: "LOCK"

    constructor(address rootzone) {
        assembly {
            sstore(0, rootzone)
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
      returns (bytes32 value, bool dir, bool lock) {
        bytes32 hkey = keccak256(abi.encode(zone, key));
        bytes32 flags;
        assembly {
            value := sload(hkey)
            flags := sload(add(hkey, 1))
            dir := eq(1, and(flags, 1))
            lock := eq(2, and(flags, 2))
        }
    }

    function set(bytes32 key, bytes32 val, bool dir, bool lock) payable external {
        bytes32 hkey = keccak256(abi.encode(key, val));
        bytes32 flags;
        assembly {
            flags := sload(add(hkey, 1))
            if eq(flags, and(flags, 2)) { revert("LOCK", 4) }
            flags := 0
            if dir { flags := and(flags, 1) }
            if lock { flags := and(flags, 2) }
            sstore(hkey, val)
            sstore(add(hkey, 1), flags)
            log4(caller(), key, val, flags, 0, 0)
        }
    }
}