import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Bridgeable } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function pickBridgeable({
    kv, rlb
}:{ kv:Deno.Kv, rlb:RLB }) {

    // get an iterator that will let us iterate through bridgeables on KV
    const iter = kv.list<Bridgeable|undefined>({ prefix: ['bridgeable'] })
    // construct an empty list
    const bridgeables:Bridgeable[] = []

    // loop until there are no more bridgeables
    let i = 0
    while (true) {

        // get result from iter
        // failure consequence: might miss at least one chain, worst case we return no chains and try again later
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Getting next bridgeable ${i++}`)
        const result = await rlb.regulate({ fn: iter.next.bind(iter), args: [] })
            .catch(reason => console.error(new Error(reason)))
        // if iter is done or we get an error, break the loop
        if (!result || result.done) break
        // otherwise, if the iter result contains a bridgeable, add it to our list
        if (result.value.value) bridgeables.push(result.value.value) 

    }

    // we may or may not have chains, depending on what's available and if/when we get an error during iteration
    // try to return the first chain, note it could be undefined
    return bridgeables.sort((a, b) => a.lastUpdated - b.lastUpdated).at(0) ?? null

}