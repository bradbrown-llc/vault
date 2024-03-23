RETURN      PUSH2               CALLDATACOPY size
            .rs                 runsize
            PUSH2               CALLDATACOPY offset, counter where run code starts
            .ro                 runoffset
            PUSH0               CALLDATACOPY destOffset
            CODECOPY
            PUSH2               RETURN size
            .rs                 runsize
            PUSH0               RETURN offset
            RETURN
RUNOFF