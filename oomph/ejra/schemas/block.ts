import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { q } from './q.ts'
import { tx } from './tx.ts'
export const block = z.object({
    number: q.nullable(),
    hash: z.string().nullable(),
    parentHash: z.string(),
    nonce: z.string().nullable(),
    sha3Uncldes: z.string().nullable().optional(),
    logsBloom: z.string().nullable(),
    transactionsRoot: z.string(),
    stateRoot: z.string(),
    receiptsRoot: z.string(),
    miner: z.string(),
    difficulty: q,
    totalDifficulty: q,
    extraData: z.string(),
    size: q,
    gasLimit: q,
    gasUsed: q,
    timestamp: q,
    transactions: tx.array().or(z.string().array()),
    uncles: z.string().array()
})