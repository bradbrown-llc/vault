VERIFOWNER  JUMPDEST
            PUSH0 
            SLOAD 
            CALLER 
            EQ
            PUSH2
            &ISOWNER 
            JUMPI               verify caller is equal to address in slot 0 (owner)
NOTOWNER    PUSH0
            PUSH0 
            MSTORE8 
            PUSH1
            0x01  
            PUSH0 
            REVERT 
ISOWNER     JUMPDEST
