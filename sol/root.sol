/// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.11;

import { Dmap } from './dmap.sol';

contract RootZone {
    Dmap    public immutable dmap;
    uint256 public           last;
    bytes32 public           park;
    uint256        immutable FREQ = 31 hours;
    bytes32        immutable LOCK = bytes32(uint256(1 << 255));

    event Mark(bytes32 indexed hash);
    event Etch(bytes32 indexed name, address indexed zone);

    error ErrPending();
    error ErrExpired();
    error ErrPayment();
    error ErrReceipt();

    constructor(Dmap d) {
        dmap = d;
        bytes32 DMAP = bytes32(bytes20(address(dmap)));
        bytes32 SELF = bytes32(bytes20(address(this)));
        dmap.set('dmap', DMAP, LOCK);
        dmap.set('root', SELF, LOCK);
        emit Etch('dmap', address(dmap));
        emit Etch('root', address(this));
    }

    function mark(bytes32 hash) external payable {
        if (block.timestamp < last + FREQ) revert ErrPending();
        if (msg.value != 1 ether) revert ErrPayment();
        (bool ok, ) = block.coinbase.call{value:(10**18)}("");
        if (!ok) revert ErrReceipt();
        last = block.timestamp;
        park = hash;
        emit Mark(hash);
    }

    function etch(bytes32 salt, bytes32 name, address zone) external {
        bytes32 hash = keccak256(abi.encode(salt, name, zone));
        if (hash != park) revert ErrExpired();
        dmap.set(name, bytes32(bytes20(zone)), LOCK);
        emit Etch(name, zone);
    }
}
