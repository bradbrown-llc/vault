import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import { Bridgeable, ProcParam } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function holdParam({
    log, chain, kv, rlb
}:{
    log:Log
    chain:Bridgeable
    kv:Deno.Kv
    rlb:RLB
}) {

    // get DZHV_MACHINE_ID env var (assume it exists since we checked at process start)
    const DZHV_MACHINE_ID = Deno.env.get('DZHV_MACHINE_ID') as string

    // shorthands and typing
    const hash = log.transactionHash
    const param:ProcParam = { log, chain }

    // try to coerce param to only hold
    // failure consequence - event lost, will need to rescan
    const atom = kv.atomic()
    const fn = atom
        .check( // verify that param isn't in ARCV
            { key: ['ARCV', hash], versionstamp: null },
        )
        .delete(['PROC', hash]) // delete param from PROC
        .delete(['MCHN', DZHV_MACHINE_ID, hash]) // delete param from MCHN
        .set(['HOLD', hash], param) // set param in HOLD
        .commit
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Moving param ${hash.slice(-4)} to KV HOLD`)
    await rlb.regulate({ fn: fn.bind(atom), args: [] })
    // log errors
    .catch(reason => console.error(new Error(reason)))
    
}