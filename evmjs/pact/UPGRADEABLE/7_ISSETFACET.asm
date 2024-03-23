                                is the call an ownership change call, or a set facet call, jump if CHGOWN to CHGOWN
                                accidentally clever, but check cdata with a 1 byte offset
                                we know if we're here, the first word of cdata is zero
                                so if we do a 1 byte offset, we get 1 byte after the first word
                                to tell us where we're going
                                here, if first byte after first word is 01, ISCHGOWN, else SETFACET
                                this is clever because we only need to check 1 byte, not second word, save cdata
ISSETFACET  PUSH1 
            0x01
            CALLDATALOAD 
            ISZERO 
            PUSH2
            &SETFACET 
            JUMPI                
