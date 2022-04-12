/// SPDX-License-Identifier: AGPL-3.0

// One day, someone is going to try very hard to prevent you
// from accessing one of these storage slots.

pragma solidity 0.8.13;

interface Dmap {
    error LOCK();
    event Set(
        address indexed zone,
        bytes32 indexed name,
        bytes32 indexed meta,
        bytes32 indexed data
    ) anonymous;

    function get(address zone, bytes32 name) external view
        returns (bytes32 meta, bytes32 data);
    function set(bytes32 name, bytes32 meta, bytes32 data) external;
    function slot(bytes32 s) external view returns (bytes32);
    function pair(bytes32 s) external view returns (bytes32 meta, bytes32 data);
}

contract _dmap_ {
    bytes32 constant FLAG_LOCK = 0x8000000000000000000000000000000000000000000000000000000000000000;
    bytes4  constant SIG_LOCK  = 0xa4f0d7d0; // LOCK()

    error LOCK();  // export in ABI

    constructor(address rootzone) { assembly {
        sstore(0, FLAG_LOCK)
        sstore(1, shl(96, rootzone))
    }}

    fallback() external payable { assembly {
        if eq(68, calldatasize()) {
            calldatacopy(0, 4, 64)
            let slot := keccak256(0, 64)
            mstore(0, sload(slot))
            mstore(32, sload(add(slot, 1)))
            return(0, 64)
        }
        if eq(100, calldatasize()) {
            let name := calldataload(4)
            let meta := calldataload(36)
            let data := calldataload(68)
            mstore(0, caller())
            mstore(32, name)
            let slot := keccak256(0, 64)
            log4(0, 0, caller(), name, meta, data)
            sstore(add(slot, 1), data)
            if iszero(and(FLAG_LOCK, sload(slot))) {
                sstore(slot, meta)
                return(0, 0)
            }
            mstore(0, SIG_LOCK)
            revert(0, 4)
        }
        revert(0, 0)
    }}

}
