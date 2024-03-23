// SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.1;

contract Forutsi {
    
    function checkPrediction(bytes memory predictionHex) public view {
        assembly {
            {
                let varCount := mload(add(predictionHex, 0x60))
                for { let i := 0 } lt(i, mload(add(predictionHex, mload(add(predictionHex, 0x20))))) { i := add(i, 1) } {
                    let get_i := mload(add(predictionHex, add(0x20, add(mul(i, 0x20), mload(add(predictionHex, 0x20))))))
                    let scratchPtr := add(predictionHex, mload(add(predictionHex, 0xC0)))
                    pop(staticcall(gas(), shr(0x60, mload(add(predictionHex, get_i))), add(predictionHex, add(0xB4, get_i)), mload(add(predictionHex, add(0x94, get_i))), scratchPtr, mload(add(predictionHex, add(0x14, get_i)))))
                    for { let j := 0 } lt(j, mload(add(predictionHex, add(0x34, get_i)))) { j := add(j, 1) } {
                        let ret_jSize := mload(add(mul(j, 0x20), add(predictionHex, add(0x54, get_i))))
                        for { let k := 0 } lt(k, ret_jSize) { k := add(k, 0x20) } {
                            mstore(add(add(predictionHex, add(0x20, mload(add(mul(j, 0x20), add(mul(varCount, 0x20), add(predictionHex, add(0x20, mload(add(predictionHex, 0x40))))))))), k), mload(add(scratchPtr, k)))
                        }
                        scratchPtr := add(scratchPtr, ret_jSize)
                    }
                    varCount := add(varCount, mload(add(predictionHex, add(0x34, get_i))))
                }
            }
            
        }
    }
    
}