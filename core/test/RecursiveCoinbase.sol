pragma solidity 0.8.13;

import "../root.sol";

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
