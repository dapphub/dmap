pragma solidity 0.8.13;

/*
    reading revert data is a hardhat feature, it's not actually part of
    tx receipt

    use ErrorWrapper with the reverting contract's ABI
    ErrorWrapper will forward the calldata and store the calldata without
    reverting the tx
*/
contract ErrorWrapper {

    constructor(address _c) {
        assembly {
            sstore(0, _c)
            sstore(1, 1)
            sstore(2, 0)
        }
    }

    fallback() external payable {
        address c;
        assembly {
            c := sload(0)
        }
        (bool ok, bytes memory _outdata) = c.call{value: msg.value}(msg.data);
        bytes32 outdata = bytes32(_outdata);

        if (ok == false) payable(msg.sender).transfer(msg.value);

        assembly {
            sstore(1, ok)
            sstore(2, outdata)
        }
    }

}
