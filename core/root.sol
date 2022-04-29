/// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.13;

import { Dmap } from './dmap.sol';

contract RootZone {
    Dmap    public immutable dmap;
    uint256        immutable FREQ = 31 hours;
    bytes32        immutable LOCK = bytes32(uint256(1 << 255));
    bytes32 public            dark;
    bytes32 public            mark;
    uint256 public            pile;
    uint256 public            term;
    address public            user;

    mapping(address=>uint256) public back;

    event Ante(uint256 indexed pile);
    event Hark(bytes32 indexed mark);
    event Etch(bytes32 indexed name, address indexed zone);

    error ErrExpired();
    error ErrPayment();
    error ErrPending();
    error ErrReceipt();
    error ErrRefund();

    constructor(Dmap d) {
        dmap = d;
    }

    function ante(bytes32 hash) external payable {
        if (msg.value <= pile * 101 / 100) revert ErrPayment();
        if (block.timestamp >= term && pile != 0) revert ErrPending();
        back[user] += pile;
        pile = msg.value;
        user = msg.sender;
        dark = hash;
        term = block.timestamp + FREQ;
        emit Ante(pile);
    }

    function withdraw() external {
        (bool ok,) = payable(msg.sender).call{value: back[msg.sender]}("");
        if (!ok) revert ErrRefund();
        back[user] = 0;
    }

    function hark() external {
        if (block.timestamp < term) revert ErrPending();
        (bool ok, ) = block.coinbase.call{value: pile}("");
        if (!ok) revert ErrReceipt();
        pile = 0;
        mark = dark;
        emit Hark(mark);
    }

    function etch(bytes32 salt, bytes32 name, address zone) external {
        bytes32 hash = keccak256(abi.encode(salt, name, zone));
        if (hash != mark) revert ErrExpired();
        dmap.set(name, LOCK, bytes32(bytes20(zone)));
        emit Etch(name, zone);
    }
}
