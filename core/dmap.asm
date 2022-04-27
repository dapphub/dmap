{
        if eq(36, calldatasize()) {
            mstore(0, sload(calldataload(4)))
            mstore(32, sload(add(1, calldataload(4))))
            return(0, 64)
        }
        let name := calldataload(4)
        let meta := calldataload(36)
        let data := calldataload(68)
        mstore(0, caller())
        mstore(32, name)
        let slot := keccak256(0, 64)
        log4(0, 0, caller(), name, meta, data)
        sstore(add(slot, 1), data)
        if iszero(or(xor(100, calldatasize()), and(sload(slot), 0x8000000000000000000000000000000000000000000000000000000000000000))) {
            sstore(slot, meta)
            return(0, 0)
        }
        if eq(100, calldatasize()) {
            mstore(0, 0xa4f0d7d0)
            revert(0, 4)
        }
        revert(0, 0)
}

