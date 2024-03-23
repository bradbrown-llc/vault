// SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.1;

contract Test {
    
    function checkCriteria(bytes memory data) public view returns (bool) {
        bytes1 operator;
        address contractAddr;
        bytes memory callData;
        bytes memory compareData;
        (operator, contractAddr, callData, compareData) = parseCriteriaHex(data);
        (bool success, bytes memory returnData) = address(contractAddr).staticcall(callData);
        require(success, "call failed");
        bool testBet;
        if (operator == 0x00) assembly { testBet := or(eq(mload(add(returnData, 0x20)), mload(add(compareData, 0x20))), lt(mload(add(returnData, 0x20)), mload(add(compareData, 0x20)))) }
        if (operator == 0x01) assembly { testBet := lt(mload(add(returnData, 0x20)), mload(add(compareData, 0x20))) }
        if (operator == 0x02)
            for (uint i = 0; i < compareData.length; i += 32) {
                assembly { 
                    testBet := eq(mload(add(returnData, add(0x20, i))), mload(add(compareData, add(0x20, i))))
                }
               if (!testBet) break;
            }
        if (operator == 0x03) 
            for (uint i = 0; i < compareData.length; i += 32) {
                assembly { 
                    testBet := eq(mload(add(returnData, add(0x20, i))), mload(add(compareData, add(0x20, i))))
                }
               if (!testBet) {
                   testBet = !testBet;
                   break;
               }
            }
        if (operator == 0x04) assembly { testBet := or(eq(mload(add(returnData, 0x20)), mload(add(compareData, 0x20))), gt(mload(add(returnData, 0x20)), mload(add(compareData, 0x20)))) }
        if (operator == 0x05) assembly { testBet := gt(mload(add(returnData, 0x20)), mload(add(compareData, 0x20))) }
        return testBet;
    }
    
    function parseCriteriaHex(bytes memory data) internal pure returns (bytes1, address, bytes memory, bytes memory) {
        bytes1 operator;
        bytes20 contractAddr;
        bytes32 callDataLengthBytes;
        assembly {
            operator := mload(add(data, 0x20))
            contractAddr := mload(add(data, 0x21))
            callDataLengthBytes := mload(add(data, 0x35))
        }
        uint callDataLength = uint(callDataLengthBytes);
        bytes memory callData = new bytes(callDataLength);
        for (uint i = 0; i < callDataLength; i += 32) {
            assembly {
                let ptr := add(callData, add(i, 0x20))
                mstore(ptr, mload(add(data, add(i, 0x55))))
            }
        }
        bytes memory compareData = new bytes(data.length - callDataLength - 53);
        for (uint i = 0; i < data.length; i += 32) {
            assembly {
                let ptr := add(compareData, add(i, 0x20))
                mstore(ptr, mload(add(data, add(i, add(callDataLength, 0x55)))))
            }
        }
        return (operator, address(contractAddr), callData, compareData);
    }
    
    function parsePredictionHex(bytes memory data) public pure returns (uint40, uint8, bytes memory, bytes memory, bytes[] memory) {
        (uint40 expiry, uint8 criteriaCount, bytes memory operators, bytes memory priorities) = parsePredictionHexParams(data);
        bytes[] memory criteria = parsePredictionHexCriteria(data);
        return (expiry, criteriaCount, operators, priorities, criteria);
    }
    
    function parsePredictionHexParams(bytes memory data) internal pure returns (uint40, uint8, bytes memory, bytes memory) {
        bytes5 expiryBytes;
        bytes1 criteriaCountBytes;
        assembly {
            expiryBytes := mload(add(data, 0x20))
            criteriaCountBytes := mload(add(data, 0x25))
        }
        bytes memory operators = new bytes(uint8(criteriaCountBytes) - 1);
        bytes memory priorities = new bytes(uint8(criteriaCountBytes) - 1);
        for (uint i = 0; i < uint8(criteriaCountBytes) - 1; i += 2) {
            assembly {
                let ptr := add(operators, add(0x20, i))
                mstore(ptr, mload(add(data, add(0x21, i))))
                ptr := add(priorities, add(0x20, i))
                mstore(ptr, mload(add(data, add(0x22, i))))
            }
        }
        return (uint40(expiryBytes), uint8(criteriaCountBytes), operators, priorities);
    }
    
    function parsePredictionHexCriteria(bytes memory data) internal pure returns (bytes[] memory) {
        bytes5 expiryBytes;
        bytes1 criteriaCountBytes;
        assembly {
            expiryBytes := mload(add(data, 0x20))
            criteriaCountBytes := mload(add(data, 0x25))
        }
        bytes memory operators = new bytes(uint8(criteriaCountBytes) - 1);
        bytes memory priorities = new bytes(uint8(criteriaCountBytes) - 1);
        bytes[] memory criteria = new bytes[](uint8(criteriaCountBytes));
        for (uint i = 0; i < uint8(criteriaCountBytes) - 1; i += 2) {
            assembly {
                let ptr := add(operators, add(0x20, i))
                mstore(ptr, mload(add(data, add(0x21, i))))
                ptr := add(priorities, add(0x20, i))
                mstore(ptr, mload(add(data, add(0x22, i))))
            }
        }
        uint criteriaCounter;
        uint cursor = 32 + 1 + 5 + (uint8(criteriaCountBytes) - 1) * 2;
        while (cursor < data.length) {
            bytes32 criteriaLengthBytes;
            assembly {
                criteriaLengthBytes := mload(add(data, cursor))
                cursor := add(0x20, cursor)
            }
            bytes memory criterium = new bytes(uint(criteriaLengthBytes));
            for (uint i = 0; i < uint(criteriaLengthBytes); i += 32) {
                assembly {
                    let ptr := add(criterium, add(0x20, i))
                    mstore(ptr, mload(add(data, add(cursor, i))))
                }
            }
            cursor += uint(criteriaLengthBytes);
            criteria[criteriaCounter] = criterium;
            criteriaCounter += 1;
        }
        return criteria;
    }
    
    function checkPrediction(bytes memory data) public view returns (bool[] memory) {
        (/*uint40 expiry, */,uint8 criteriaCount,,, /*bytes memory operators, bytes memory priorities, */bytes[] memory criteria) = parsePredictionHex(data);
        bool[] memory criteriaChecks = new bool[](criteriaCount);
        for (uint i = 0; i < criteriaCount; i++) {
            criteriaChecks[i] = checkCriteria(criteria[i]);
        }
        return criteriaChecks;
    }
}