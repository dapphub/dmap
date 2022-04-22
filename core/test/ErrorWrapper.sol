pragma solidity 0.8.13;
import 'hardhat/console.sol';

/*
    reading revert data is a hardhat feature, it's not actually part of
    tx receipt

    use ErrorWrapper with the reverting contract's ABI
    ErrorWrapper will forward the calldata and store the calldata without
    reverting the tx
*/
contract ErrorWrapper {
    address public c;
    bool public ok;
    bytes public data;


    constructor(address _c) {
        c = _c;
        ok = true;
    }

    fallback(bytes calldata) external payable returns (bytes memory) {
        (ok, data) = c.call{value: msg.value}(msg.data);

        if (ok == false) payable(msg.sender).transfer(msg.value);
        return data;
    }

}
