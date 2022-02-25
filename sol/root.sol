/// SPDX-License-Identifier: AGPL-3.0
// The complete text of the (Apache) GNU Public License is available at these URLs:
//     ipfs://

pragma solidity 0.8.10;

import { Dmap } from './dmap.sol';

contract DmapRootZone {
    Dmap                        public immutable dmap;
    mapping(bytes32 => uint256) public           marks;

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
        if (block.timestamp < marks[hash] + 6 hours) revert ErrPending();
        marks[hash] = block.timestamp;
        if (msg.value != 1 ether) revert ErrPayment();
        (bool ok, ) = block.coinbase.call{value:1 ether}("");
        if (!ok) revert ErrReceipt();
        emit Mark(hash);
    }

    function etch(bytes32 salt, bytes32 name, address zone) external {
        bytes32 hash = keccak256(abi.encode(msg.sender, salt, name, zone));
        if (block.timestamp > marks[hash] + 6 hours) revert ErrExpired();
        dmap.set(name, bytes32(bytes20(zone)), true, true);
        emit Etch(name, zone);
    }
}
