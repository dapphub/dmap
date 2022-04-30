pragma solidity 0.8.13;

import "../root.sol";

contract RecursiveCoinbase {
    bool lock = false;
    fallback () external payable {
        if( !lock ) {
            lock = true;
            RootZone rz = RootZone(msg.sender);
            rz.hark();
            lock = false;
        }
    }
}

contract RecursiveWithdraw {
    bool lock = false;
    RootZone rz;
    constructor(address _rz) {
        rz = RootZone(_rz);
    }

    function ante(bytes32 hash) external payable {
        rz.ante{value: msg.value}(hash);
    }

    function withdraw() external {
        rz.withdraw();
    }

    fallback () external payable {
        if (!lock) {
            lock = true;
            rz.withdraw();
            lock = false;
        }
    }
}
