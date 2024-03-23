// SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.1;

contract Forutsi {
 
    /*function checkPrediction(bytes memory data) public view returns (bool) {
        
    }*/
    
    function test(bytes memory predictionHex) public view {
        assembly {
            let ptr := mload(0x40)
            let PO := mload(add(predictionHex, 0x80))
            let PL := sub(mload(predictionHex), PO)
            let predictionHexData := add(0x20, predictionHex)
            let i := 0
            for {} lt(i, PL) { i:= add(i, 0x20) } {
                mstore(add(ptr, i), mload(add(add(predictionHexData, PO), i)))
            }
            let P := ptr
            ptr := add(ptr, PL)
            let stepType := byte(0, mload(P))
            mstore(0x40, add(ptr, 0x01))
            switch stepType
            case 0x00 {
                let getIndex := mload(ptr)
                ptr := add(predictionHexData, mload(add(predictionHexData, mload(add(predictionHexData, 0x20)))))
                let to := shr(0x60, and(mload(ptr), 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000))
                ptr := add(predictionHexData, mload(add(add(ptr, 0x14), 0x20)))
                let callDataLen := mload(ptr)
                ptr := add(ptr, 0x20)
                pop(staticcall(gas(), to, ptr, callDataLen, mload(0x40), mload(add(ptr, callDataLen))))
                ptr := mload(0x40)
                
            }
        }
    }
    
}