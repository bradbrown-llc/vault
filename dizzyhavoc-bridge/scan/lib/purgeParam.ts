import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/Log.ts'
import { Bridgeable } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function purgeParam({
    log, chain, hash, kv, rlb
}:{
    log?:Log
    chain?:Bridgeable
    hash:string
    kv:Deno.Kv
    rlb:RLB
}) {

    // get DZHV_MACHINE_ID env var (assume it exists since we checked at process start)
    const DZHV_MACHINE_ID = Deno.env.get('DZHV_MACHINE_ID') as string

    // attempt to purge param from everything. don't need to verify anything because this isn't moving state, it's obliterating it
    // failure consequence: purge fails, this is only an extra step to make sure reorgs are not processed, but should not be a probelm
    const atom = kv.atomic()
    const fn = atom
        .delete(['PROC', hash])
        .delete(['MCHN', DZHV_MACHINE_ID, hash])
        .delete(['HOLD', hash])
        .delete(['DONE', hash])
        .delete(['ARCV', hash])
        .commit
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Purging hash ${hash.slice(-4)}`)
    await rlb.regulate({ fn: fn.bind(atom), args: [] })
        // log errors
        .catch(reason => console.error(new Error(reason)))
    
}