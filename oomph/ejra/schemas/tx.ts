import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { q } from './q.ts'
export const tx = z.object({
    blockHash: z.string().nullable(),
    blockNumber: q.nullable(),
    from: z.string(),
    gas: q,
    gasPrice: q,
    hash: z.string(),
    input: z.string(),
    nonce: q,
    to: z.string().nullable(),
    transactionIndex: q.nullable(),
    value: q,
    v: z.unknown(),
    r: z.unknown(),
    s: z.unknown()
}).nullable()