pragma solidity 0.8.13;

import "../root.sol";

// fallback is not payable
contract UnrefundableBidder1 {
    function bid(bytes32 hash, RootZone rootzone) external payable {
        RootZone rz = RootZone(rootzone);
        rz.ante{value: msg.value}(hash);
    }

    fallback() external { }
}

// fallback burns all gas
contract UnrefundableBidder2 {
    function bid(bytes32 hash, RootZone rootzone) external payable {
        RootZone rz = RootZone(rootzone);
        rz.ante{value: msg.value}(hash);
    }

    fallback() external payable { while (true) {} }
}

// fallback reverts
contract UnrefundableBidder3 {
    error Rejected();

    function bid(bytes32 hash, RootZone rootzone) external payable {
        RootZone rz = RootZone(rootzone);
        rz.ante{value: msg.value}(hash);
    }

    fallback() external payable { revert Rejected(); }
}
