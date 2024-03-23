// SPDX-License-Identifier: 0BSD

pragma solidity ^0.8.1;

contract Forutsi {
    
    function checkPrediction(bytes memory predictionHex) public view {
        assembly {
            { //getsLoop
                //varCount == mload(+0x60)
                let varCount := mload(add(predictionHex, 0x60))
                //getsLoop; get all external contract data required by prediction and store as vars
                for { let i := 0 } lt(i, mload(add(predictionHex, mload(add(predictionHex, 0x20))))) { i := add(i, 1) } {
                    //run staticcall; gas(), a, in, inS, out, outS
                    //a == shr(0xC, mload(+get_i)), get_i == mload(+getOffset+0x20+i*0x20), getOffset == mload(+0x20)
                    let get_i := mload(add(predictionHex, add(0x20, add(mul(i, 0x20), mload(add(predictionHex, 0x20))))))
                    //let to := shr(0x60, mload(add(predictionHex, get_i)))
                    //inPtr == +get_i+0xB4
                    //let inPtr := add(predictionHex, add(0xB4, get_i))
                    //inSize == mload(+get_i+94)
                    //let inSize := mload(add(predictionHex, add(0x94, get_i)))
                    //out  == +mload(+scratchOffset), scratchOffset == mload(+0xC0)
                    //let outPtr := add(predictionHex, mload(add(predictionHex, 0xC0)))
                    //outSize == mload(+get_i+14)
                    //let outSize := mload(add(predictionHex, add(0x14, get_i)))
                    let scratchPtr := add(predictionHex, mload(add(predictionHex, 0xC0)))
                    pop(staticcall(gas(), shr(0x60, mload(add(predictionHex, get_i))), add(predictionHex, add(0xB4, get_i)), mload(add(predictionHex, add(0x94, get_i))), scratchPtr, mload(add(predictionHex, add(0x14, get_i)))))
                    //staticcallRetToVarsLoop
                    //retsCount == mload(+get_i+34)
                    for { let j := 0 } lt(j, mload(add(predictionHex, add(0x34, get_i)))) { j := add(j, 1) } {
                        //need to get var_(j+varCount)Ptr and ret_jPtr and ret_jSize, then store ret_j into var_(j+varCount)
                        //var_(j+varCount)Ptr == +varOffset_(j+varCount)+0x20,
                        //varOffset_(j+varCount) == mload(mul(j, 0x20)+mul(varCount, 0x20)++varsOffset+0x20), varsOffset == mload(+0x40)
                        let ret_jSize := mload(add(mul(j, 0x20), add(predictionHex, add(0x54, get_i))))
                        for { let k := 0 } lt(k, ret_jSize) { k := add(k, 0x20) } {
                            mstore(add(add(predictionHex, add(0x20, mload(add(mul(j, 0x20), add(mul(varCount, 0x20), add(predictionHex, add(0x20, mload(add(predictionHex, 0x40))))))))), k), mload(add(scratchPtr, k)))
                        }
                        scratchPtr := add(scratchPtr, ret_jSize)
                    }
                    varCount := add(varCount, mload(add(predictionHex, add(0x34, get_i))))
                }
            }
            //now start the processing step
            //get the first byte of the processing step
            //byte(0, +processingOffset+0x20), processingOffset == mload(+0x80)
            let processPtr := add(predictionHex, add(0x20, mload(add(predictionHex, 0x80))))
            let stackPtr := add(predictionHex, mload(add(predictionHex, 0xA0)))
            //initialize stackCounter
            mstore(stackPtr, 0x0)
            for {} lt(processPtr, add(processPtr, mload(add(predictionHex, mload(add(predictionHex, 0x80)))))) {} {
                let stepType := byte(0, mload(processPtr))
                switch stepType
                case 0x00 { //store variable to stack
                    processPtr := add(processPtr, 0x01)
                    //store varType 0x01 (variable) at stackPtr+0x20*(stackCounter+1)
                    mstore(add(stackPtr, mul(0x40, add(mload(stackPtr), 1))), 0x01)
                    //store varNum == mload(processPtr) at 0x20+stackPtr+0x20*(stackCounter+1), then incrememnt stackCounter by 1, then processPtr by 0x20
                    mstore(add(0x20, add(stackPtr, mul(0x40, add(mload(stackPtr), 1)))), mload(processPtr))
                    mstore(stackPtr, add(mload(stackPtr), 1))
                    processPtr := add(processPtr, 0x20)
                }
                case 0x01 { //add last two variables, return to 0x20stackPtr+0x20*(stackCounter-1), decrement stackCounter by 1, increment processPtr by 0x01
                    //lastVariableNum == mload(stackPtr+stackCounter*0x20)
                    let lastVariableType := mload(add(stackPtr, mul(mload(stackPtr), 0x40)))
                    let secondToLastVariableType := mload(add(stackPtr, mul(sub(mload(stackPtr), 1), 0x40)))
                    let lastVariableNum
                    let secondToLastVariableNum
                    let lastVariable
                    let secondToLastVariable
                    switch lastVariableType
                    case 0x00 {
                        lastVariable := mload(add(0x20, add(stackPtr, mul(mload(stackPtr), 0x40))))
                    }                        
                    default {
                        lastVariableNum := mload(add(0x20, add(stackPtr, mul(mload(stackPtr), 0x40))))
                        lastVariable := mload(add(predictionHex, add(0x20, mload(add(predictionHex, add(0x20, add(mul(lastVariableNum, 0x20), mload(add(predictionHex, 0x40)))))))))
                    }
                    switch secondToLastVariableType
                    case 0x00 {
                        secondToLastVariable := mload(add(0x20, add(stackPtr, mul(sub(mload(stackPtr), 1), 0x40))))
                    }
                    default {
                        secondToLastVariableNum := mload(add(0x20, add(stackPtr, mul(sub(mload(stackPtr), 1), 0x40))))
                        secondToLastVariable := mload(add(predictionHex, add(0x20, mload(add(predictionHex, add(0x20, add(mul(secondToLastVariableNum, 0x20), mload(add(predictionHex, 0x40)))))))))
                    }
                    //getVariableFromNum == mload(var_iPtr), var_iPtr == +varOffset_i+0x20, varOffset_i == mload(+varsOffset+0x20+mul(varNum, 0x20)), varsOffset == mload(+0x40)
                    // store varType 0x00 (literal)
                    mstore(add(stackPtr, mul(0x40, sub(mload(stackPtr), 1))), 0x00)
                    mstore(add(0x20, add(stackPtr, mul(0x40, sub(mload(stackPtr), 1)))), add(secondToLastVariable, lastVariable))
                    mstore(stackPtr, sub(mload(stackPtr), 1))
                    processPtr := add(processPtr, 0x01)
                }
                /*case 0x0E { //eq op
                    //lastVariableNum == mload(stackPtr+stackCounter*0x20)
                    let lastVariableNum := mload(add(stackPtr, mul(mload(stackPtr), 0x20)))
                    let secondToLastVariableNum := mload(add(stackPtr, mul(sub(mload(stackPtr), 1), 0x20)))
                    //getVariableFromNum == mload(var_iPtr), var_iPtr == +varOffset_i+0x20, varOffset_i == mload(+varsOffset+0x20+mul(varNum, 0x20)), varsOffset == mload(+0x40)
                    let lastVariable := mload(add(predictionHex, add(0x20, mload(add(predictionHex, add(0x20, add(mul(lastVariableNum, 0x20), mload(add(predictionHex, 0x40)))))))))
                    let secondToLastVariable := mload(add(predictionHex, add(0x20, mload(add(predictionHex, add(0x20, add(mul(secondToLastVariableNum, 0x20), mload(add(predictionHex, 0x40)))))))))
                    mstore(add(stackPtr, mul(0x20, sub(mload(stackPtr), 1))), eq(secondToLastVariable, lastVariable))
                    mstore(stackPtr, sub(mload(stackPtr), 1))
                    processPtr := add(processPtr, 0x01)
                }*/
                default { 
                    return(0, 0)
                } 
            }
        }
    }
    
}