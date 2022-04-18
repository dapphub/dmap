
/// @use-src 1:"dmap.sol"
object "_dmap_" {
    code {
        /// @src 1:679:1827  "contract _dmap_ {..."
        mstore(64, memoryguard(128))
        if callvalue() { revert_error_ca66f745a3ce8ff40e2ccaf1ad45db7774001b90d25810abd9040049be7bf4bb() }

        let _1 := copy_arguments_for_constructor_118_object__dmap_()
        constructor__dmap_(_1)

        let _2 := allocate_unbounded()
        codecopy(_2, dataoffset("_dmap__deployed"), datasize("_dmap__deployed"))

        return(_2, datasize("_dmap__deployed"))

        function allocate_unbounded() -> memPtr {
            memPtr := mload(64)
        }

        function revert_error_ca66f745a3ce8ff40e2ccaf1ad45db7774001b90d25810abd9040049be7bf4bb() {
            revert(0, 0)
        }

        function round_up_to_mul_of_32(value) -> result {
            result := and(add(value, 31), not(31))
        }

        function panic_error_0x41() {
            mstore(0, 35408467139433450592217433187231851964531694900788300625387963629091585785856)
            mstore(4, 0x41)
            revert(0, 0x24)
        }

        function finalize_allocation(memPtr, size) {
            let newFreePtr := add(memPtr, round_up_to_mul_of_32(size))
            // protect against overflow
            if or(gt(newFreePtr, 0xffffffffffffffff), lt(newFreePtr, memPtr)) { panic_error_0x41() }
            mstore(64, newFreePtr)
        }

        function allocate_memory(size) -> memPtr {
            memPtr := allocate_unbounded()
            finalize_allocation(memPtr, size)
        }

        function revert_error_dbdddcbe895c83990c08b3492a0e83918d802a52331272ac6fdb6a7c4aea3b1b() {
            revert(0, 0)
        }

        function revert_error_c1322bf8034eace5e0b5c7295db60986aa89aae5e0ea0873e4689e076861a5db() {
            revert(0, 0)
        }

        function cleanup_t_uint160(value) -> cleaned {
            cleaned := and(value, 0xffffffffffffffffffffffffffffffffffffffff)
        }

        function cleanup_t_address(value) -> cleaned {
            cleaned := cleanup_t_uint160(value)
        }

        function validator_revert_t_address(value) {
            if iszero(eq(value, cleanup_t_address(value))) { revert(0, 0) }
        }

        function abi_decode_t_address_fromMemory(offset, end) -> value {
            value := mload(offset)
            validator_revert_t_address(value)
        }

        function abi_decode_tuple_t_address_fromMemory(headStart, dataEnd) -> value0 {
            if slt(sub(dataEnd, headStart), 32) { revert_error_dbdddcbe895c83990c08b3492a0e83918d802a52331272ac6fdb6a7c4aea3b1b() }

            {

                let offset := 0

                value0 := abi_decode_t_address_fromMemory(add(headStart, offset), dataEnd)
            }

        }

        function copy_arguments_for_constructor_118_object__dmap_() -> ret_param_0 {
            let programSize := datasize("_dmap_")
            let argSize := sub(codesize(), programSize)

            let memoryDataOffset := allocate_memory(argSize)
            codecopy(memoryDataOffset, programSize, argSize)

            ret_param_0 := abi_decode_tuple_t_address_fromMemory(memoryDataOffset, add(memoryDataOffset, argSize))
        }

        /// @ast-id 118
        /// @src 1:895:1010  "constructor(address rootzone) { assembly {..."
        function constructor__dmap_(var_rootzone_113) {

            /// @src 1:895:1010  "constructor(address rootzone) { assembly {..."

            /// @src 1:927:1009  "assembly {..."
            {
                sstore(0, 57896044618658097711785492504343953926634992332820282019728792003956564819968)
                sstore(1, shl(96, var_rootzone_113))
            }

        }
        /// @src 1:679:1827  "contract _dmap_ {..."

    }
    /// @use-src 1:"dmap.sol"
    object "_dmap__deployed" {
        code {
            /// @src 1:679:1827  "contract _dmap_ {..."
            mstore(64, 128)

            fun__123() stop()

            function shift_right_224_unsigned(value) -> newValue {
                newValue :=

                shr(224, value)

            }

            /// @ast-id 123
            /// @src 1:1016:1824  "fallback() external payable { assembly {..."
            function fun__123() {

                /// @src 1:1046:1823  "assembly {..."
                {
                    if eq(36, calldatasize())
                    {
                        let usr$slot := calldataload(4)
                        mstore(0, sload(usr$slot))
                        mstore(32, sload(add(usr$slot, 1)))
                        return(0, 64)
                    }
                    if eq(100, calldatasize())
                    {
                        let usr$name := calldataload(4)
                        let usr$meta := calldataload(36)
                        let usr$data := calldataload(68)
                        mstore(0, caller())
                        mstore(32, usr$name)
                        let usr$slot := keccak256(0, 64)
                        log4(0, 0, caller(), usr$name, usr$meta, usr$data)
                        sstore(add(usr$slot, 1), usr$data)
                        if iszero(and(57896044618658097711785492504343953926634992332820282019728792003956564819968, sload(usr$slot)))
                        {
                            sstore(usr$slot, usr$meta)
                            return(0, 0)
                        }
                        mstore(0, 74604839946335966670872529434618519072855137166631191409275136255638626107392)
                        revert(0, 4)
                    }
                    revert(0, 0)
                }

            }
            /// @src 1:679:1827  "contract _dmap_ {..."

        }

        data ".metadata" hex"a2646970667358221220475a4944d978a2f0381a86377d6dfc867bb2a21de12227434a9b06c9ed37cd5f64736f6c634300080d0033"
    }

}

/*
// commit c5c0ecbd5876df6c3ac6baf822454f315aedf78c

pragma solidity 0.8.13;

interface Dmap {
    error LOCK();
    event Set(
        address indexed zone,
        bytes32 indexed name,
        bytes32 indexed meta,
        bytes32 indexed data
    ) anonymous;

    function get(address zone, bytes32 name) external view
        returns (bytes32 meta, bytes32 data);
    function set(bytes32 name, bytes32 meta, bytes32 data) external;
    function slot(bytes32 s) external view returns (bytes32);
    function pair(bytes32 s) external view returns (bytes32 meta, bytes32 data);
}

contract _dmap_ {
    bytes32 constant FLAG_LOCK = 0x8000000000000000000000000000000000000000000000000000000000000000;
    bytes4  constant SIG_LOCK  = 0xa4f0d7d0; // LOCK()

    error LOCK();  // export in ABI

    constructor(address rootzone) { assembly {
        sstore(0, FLAG_LOCK)
        sstore(1, shl(96, rootzone))
    }}

    fallback() external payable { assembly {
        if eq(36, calldatasize()) {
            let slot := calldataload(4)
            mstore(0, sload(slot))
            mstore(32, sload(add(slot, 1)))
            return(0, 64)
        }
        if eq(100, calldatasize()) {
            let name := calldataload(4)
            let meta := calldataload(36)
            let data := calldataload(68)
            mstore(0, caller())
            mstore(32, name)
            let slot := keccak256(0, 64)
            log4(0, 0, caller(), name, meta, data)
            sstore(add(slot, 1), data)
            if iszero(and(FLAG_LOCK, sload(slot))) {
                sstore(slot, meta)
                return(0, 0)
            }
            mstore(0, SIG_LOCK)
            revert(0, 4)
        }
        revert(0, 0)
    }}

}
*/