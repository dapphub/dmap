pragma solidity 0.8.13;

import "../dmap.sol";

contract ErrorWrapper {
    //address public c;
    //bool public ok = true;
    //bytes public err;

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
        (bool ok, bytes memory _outdata) = c.call(msg.data);
        bytes32 outdata = bytes32(_outdata);

        assembly {
            sstore(1, ok)
            sstore(2, outdata)
        }
    }

}
