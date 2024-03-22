import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Bridgeable } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function updateBridgeable({
    chain, kv, rlb
}:{
    chain:Bridgeable,
    kv:Deno.Kv,
    rlb:RLB
}) {

    // keys
    const key = ['bridgeable', chain.chainId]

    // update chain lastUpdated in mem
    chain.lastUpdated = Date.now()

    // commit chain to KV
    // failure consequence: chain may be picked again too soon or we may fail to update a filter, causing rescanning of events
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Updating bridgeable ${chain.chainId}`)
    const result = await rlb.regulate({ fn: kv.set.bind(kv), args: [key, chain] as const })
    // log general error
        .catch(reason => console.error(new Error(reason)))
    // log commit result error
    if (!result?.ok) console.error(new Error('updateBridgeable failed to commit to KV'))

}