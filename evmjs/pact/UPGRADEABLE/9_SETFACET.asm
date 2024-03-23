                                need to store address count, use it to loop0
                                use address count to get selector count, use selector count to loop1
                                dupe and byte 1 opcode faster than load and shift (one fewer push)
                                store selector counts in reverse order, then i can directly use address count
                                for byte offset and for loop (ex. decrement address count, do loop, if zero, done)
                                load address count into one word, word past address count into one word (slct sizes)
                                need a word for cursor that goes through selectors and addresses
                                cursor should start at just past selector sizes (word + 1 + 1 + address count)
                                don't want to sub from addr count every time in loop, when we could sub addr count
                                or maybe make select sizes offset so it starts not past addr count, but just before
                                make cursor right align values, then we can take advantage of garbage data allowance
                                cursor right aligns addresses, left aligns selectors
SETFACET    JUMPDEST
            PUSH1
            0x02 
            CALLDATALOAD        [addr count]
            PUSH1
            0x22                [addr count, 0x22]
            CALLDATALOAD        [addr count, selector counts]
            PUSH1
            0x16                [addr count, selector counts, 0x16]
            DUP3                [addr count, selector counts, 0x16, addr count]
            ADD                 [addr count, selector counts, cursor]
            SWAP2               [cursor, selector counts, addr count]
LOOP0       JUMPDEST            need selector count for this address and the actual address
            PUSH1
            0x01                [cursor, selector counts, addr count, 0x01]
            SWAP1               [cursor, selector counts, 0x01, addr count]
            SUB                 [cursor, selector counts, addr count - 1]
            DUP2                [cursor, selector counts, addr count - 1, selector counts]
            DUP2                [cursor, selector counts, addr count - 1, selector counts, addr count - 1]
            BYTE                [cursor, selector counts, addr count - 1, selector count]
            DUP4                [cursor, selector counts, addr count - 1, selector count, cursor]
            CALLDATALOAD        [cursor, selector counts, addr count - 1, selector count, address]
                                advance cursor by 0x20 bytes (first selector left-aligned)
            SWAP4
       	    PUSH1
            0x20
            ADD                 [address, selector counts, addr count - 1, selector count, cursor (+32, first slct)]
            SWAP1               [a, scs, ac, c, sc]
LOOP1       JUMPDEST            store address in slots[selector]
                                decrement selector count by 1
                                if selector count is zero exit LOOP1
                                else, advance cursor by 4, reenter LOOP1
            DUP5                [a, scs, ac, c, sc, a]
            DUP3                [addr, scs, ac, c, sc, a, c]
            CALLDATALOAD        
            PUSH1 
            0xE0 
            SHR                 [a, scs, ac, c, sc, a, s]
            SSTORE              [a, scs, ac, c, sc]
            PUSH1 
            0x01
            SWAP1
            SUB                 [a, scs, ac, c, sc-1]
            DUP1                
            ISZERO              
            PUSH2               
            &LOOP1END           
            JUMPI 
            SWAP1               [a, scs, ac, sc-1, c]
            PUSH1
            0x04
            ADD                 [a, scs, ac, sc-1, c+4]
            SWAP1
            PUSH2
            &LOOP1
            JUMP 
LOOP1END    JUMPDEST            if address count is zero exit LOOP0
                                else, right align next address, reset stack to like start LOOP0
            DUP3                [a, scs, ac, c+4, sc-1, ac]
            ISZERO  
            PUSH2 
            &LOOP0END
            JUMPI
            POP                 [a, scs, ac, c]
            PUSH1 
            0x08                [a, scs, ac, c, 0x08]
            SWAP1               [a, scs, ac, 0x08, c]
            SUB                 [a, scs, ac, c-8]
            SWAP3               [c-8, scs, ac, a]
            POP                 [c-8, scs, ac]
            PUSH2 
            &LOOP0 
            JUMP 
LOOP0END    JUMPDEST
            PUSH1
            0x21                [0x21]
            DUP1                [0x21, 0x21]
            CALLDATASIZE        [0x21, 0x21, cds]
            SUB                 [0x21, s] instructions + addresses + selectors size
            DUP1                [0x21, s, s] size
            SWAP2               [s, s, 0x21] offset
            PUSH0               [s, s, 0x21, 0x0] destOffset
            CALLDATACOPY        [s]
            PUSH0               [s, 0x0] topic
            SWAP1               [0x0, s] size
            PUSH0               [0x0, s, 0x0] offset
            LOG1
END                                                                                           
