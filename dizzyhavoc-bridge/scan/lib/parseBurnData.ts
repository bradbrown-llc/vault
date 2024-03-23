import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { ejra } from '../../internal.ts'

export function parseBurnData(log:ejra.types.Log) {

    const [destinationChainId, recipient, value] = z.tuple([
        z.string().transform(s => BigInt('0x'+s)),
        z.string().transform(s => s.substring(24)),
        z.string().transform(s => BigInt('0x'+s))
    ]).parse(log.data.substring(2).match(/.{64}/g))

    return { destinationChainId, recipient, value }

}