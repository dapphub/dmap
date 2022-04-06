
contract Dmap2 { fallback() external { assembly {
    let iu := calldataload(0x00)
    let iv := add(1, iu)

    // Reads take the key pre-hashed
    if eq(calldatasize(), 0x20) {
      mstore(0x00, sload(iu))
      mstore(0x20, sload(iv))
      return(0, 0x40)
    }

    let k := calldataload(0x20)
    let u := calldataload(0x40)
    let v := calldataload(0x60)

    // Check key hash
    mstore(0x00, caller())
    mstore(0x14, k)
    if not(eq(iu, keccak256(0, 0x34))) {
      revert(0, 0)
    }

    // Check lock flag
    if and(1, sload(iu)) {
      mstore(0, 0xa4f0d7d0)
      revert(0, 4)
    }

    sstore(iu, u)
    sstore(iv, v)

    log4(0, 0, caller(), k, u, v)
} } }