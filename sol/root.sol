/// SPDX-License-Identifier: AGPL-3.0
// The complete text of the (Apache) GNU Public License is available at these URLs:
//     ipfs://

pragma solidity 0.8.10;

import { Dmap } from './dmap.sol';

contract DmapRootZone {
    Dmap    public immutable dmap;
    uint256 public           last;
    bytes32 public           mark;
    uint256 public immutable freq = 31 hours;

    event Mark(bytes32 indexed hash);
    event Etch(bytes32 indexed name, address indexed zone);

    error ErrPending();
    error ErrExpired();
    error ErrPayment();
    error ErrReceipt();

    constructor(Dmap d) {
        dmap = d;
    }

    function mark(bytes32 hash) external payable {
        if (block.timestamp < last + freq) revert ErrPending();
        if (msg.value != 1 ether) revert ErrPayment();
        (bool ok, ) = block.coinbase.call{value:1 ether}("");
        if (!ok) revert ErrReceipt();
        last = block.timestamp;
        mark = hash;
        emit Mark(hash);
    }

    function etch(bytes32 salt, bytes32 name, address zone) external {
        bytes32 hash = keccak256(abi.encode(msg.sender, salt, name, zone));
        if (block.timestamp >= last + freq) revert ErrExpired();
        dmap.set(name, bytes32(bytes20(zone)), true, true);
        emit Etch(name, zone);
    }
}
