pragma solidity 0.8.13;

import "../dmap.sol";

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
