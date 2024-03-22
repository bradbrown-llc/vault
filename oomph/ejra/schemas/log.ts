import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { q } from './q.ts'
export const log = z.object({
    removed: z.boolean(),
    logIndex: q.nullable(),
    transactionIndex: q.nullable(),
    transactionHash: z.string().nullable(),
    blockHash: z.string().nullable(),
    blockNumber: q.nullable(),
    address: z.string(),
    data: z.string(),
    topics: z.string().array()
})