/// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.11;

import { Dmap } from './dmap.sol';

contract DmapRootZone {
    Dmap    public immutable dmap;
    uint256 public           last;
    bytes32 public           park;
    uint256 public immutable freq = 31 hours;

    event Mark(bytes32 indexed hash);
    event Etch(bytes32 indexed name, address indexed zone);

    error ErrPending();
    error ErrExpired();
    error ErrPayment();
    error ErrReceipt();

    constructor(Dmap d) {
        dmap = d;
        bytes32 lockdir = bytes32(uint(3));
        bytes32 locknodir = bytes32(uint(1));
        dmap.set('dmap', bytes32(bytes20(address(d))), locknodir);
        dmap.set('root', bytes32(bytes20(address(this))), lockdir);
        dmap.set('', bytes32(bytes20(address(this))), lockdir);
        emit Etch('dmap', address(d));
        emit Etch('root', address(this));
        emit Etch('', address(this));
    }

    function mark(bytes32 hash) external payable {
        if (block.timestamp < last + freq) revert ErrPending();
        if (msg.value != 1 ether) revert ErrPayment();
        (bool ok, ) = block.coinbase.call{value:1 ether}("");
        if (!ok) revert ErrReceipt();
        last = block.timestamp;
        park = hash;
        emit Mark(hash);
    }

    function etch(bytes32 salt, bytes32 name, address zone) external {
        bytes32 hash = keccak256(abi.encode(salt, name, zone));
        if (hash != park) revert ErrExpired();
        dmap.set(name, bytes32(bytes20(zone)), bytes32(uint(0x3))); // locked & dir
        emit Etch(name, zone);
    }
}
