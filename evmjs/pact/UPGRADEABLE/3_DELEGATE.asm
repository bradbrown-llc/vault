DELEGATE    CALLDATASIZE        ^
            PUSH0               |
            PUSH0               |
            CALLDATACOPY        v make sure the calldata is in memory, required by delegatecall
            PUSH0               DC retSize
            PUSH0               DC retOffset
            CALLDATASIZE        DC argsSize
            PUSH0               DC argsOffset
            PUSH0 
            CALLDATALOAD        get first word from cdata
            PUSH1
            0xE0            
            SHR                 shift right 32 - 4 bytes (32 - 4 in hex), leaves us first 4 bytes of first word of cdata
            SLOAD               DC address, address loaded from slot specified in cdata selector (first 4 bytes)
            GAS                 DC gas
            DELEGATECALL        success bit added to stack
            RETURNDATASIZE      size
            PUSH0               offset
            PUSH0               destOffset
            RETURNDATACOPY      we didn't return the data for reasons, but we want it, rdata -> mem[0] here
            PUSH2
            &DELSUCCEED 
            JUMPI               
