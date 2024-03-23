MAKE
SETOWNER    CALLER
            PUSH0
            SSTORE
            CALLER 
            PUSH0 
            MSTORE 
            PUSH1 
            0x35                35 is the calldatasize for a runtime owner change
            PUSH1 
            0x14
            PUSH1 
            0x0C
            LOG1 
