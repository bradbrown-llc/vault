RUN
ISRETAIN    PUSH0 
            CALLDATALOAD        get first word from cdata
            ISZERO              check if it's 0
            PUSH2
            &VERIFOWNER 
            JUMPI               if it is, retain call, goto VERIFYOWNER
