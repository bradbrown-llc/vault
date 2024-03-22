import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Bridgeable } from '../types/mod.ts'
import { logstamp, loglev } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function bridgeableById({
    id, kv, rlb 
}:{ id:bigint, kv:Deno.Kv, rlb:RLB }) {

    // key
    const key = ['bridgeable', id]

    // get bridgeable
    // failure consequence: cannot determine if event is bridgeable, event will be skipped and lost, need to rescan
    const get = kv.get<Bridgeable>
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Fetching bridgeable by id ${id}`)
    const chainRes = await rlb.regulate({ fn: get.bind(kv), args: [key] as const })
        // log error
        .catch(reason => { console.error(new Error(reason)); return null })

    // return null if general error
    if (chainRes === null) return null
    
    // return false if bridge isn't found
    if (chainRes.value === null) return false
    
    // return bridgeable
    return chainRes.value
    
}