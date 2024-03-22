import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import { bridgeableById } from './mod.ts'

export async function getBurnDetails({
    log, kv, rlb
}:{ log:Log, kv:Deno.Kv, rlb:RLB }) {

    // extract the id, recipient, and value from the log
    const [id, recipient, value] = z.tuple([
        z.string().transform(s => BigInt('0x'+s)),
        z.string().transform(s => s.substring(24)),
        z.string().transform(s => BigInt('0x'+s))
    ]).parse(log.data.substring(2).match(/.{64}/g))

    // get the destination chain from the id
    const destination = await bridgeableById({ id, kv, rlb })

    // return the destination chain, recipient, and value
    return [destination, recipient, value, id] as const

}