pragma solidity 0.8.11;

import "../root.sol";
import "../dmap.sol";
import "hardhat/console.sol";

contract RecursiveCoinbase {
    bool lock = false;
    fallback () external payable {
        if( !lock ) {
            lock = true;
            RootZone rz = RootZone(msg.sender);
            rz.hark{value:1 ether}(0);
            lock = false;
        }
    }
}
