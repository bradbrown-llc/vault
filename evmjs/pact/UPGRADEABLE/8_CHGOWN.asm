                                same trick here, we know first word is zeroes, so if we tack on an address
                                and load cdata with the right offset, we can get just the address without
                                any shifting or zeroing
CHGOWN      PUSH1
            0x21
            CALLDATALOAD        first word all zeroes, next byte 1, from here address (word is address then zeroes)
            PUSH1 
            0x60
            SHR                 shift right 12 bytes (12*8), now word is zeroes then address
            PUSH0
            SSTORE              store new owner address from cdata in slot 0
            PUSH1 
            0x21
            CALLDATALOAD        get word address then zeroes again
            PUSH0 
            MSTORE              put in memory (address first)
            CALLDATASIZE        calldatasize of CHGOWN call is topic (should be 53 bytes)
            PUSH1 
            0x14                log size 20 bytes
            PUSH0               log offset 0
            LOG1                log
            STOP