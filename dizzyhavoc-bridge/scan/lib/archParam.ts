import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import { Bridgeable, ProcParam } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function archParam({
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
    const { chainId } = chain
    const paramLogId = `${hash.slice(-4)}:${chainId}`

    // try to coerce param to only archive
    // failure consequence - event lost, will need to rescan
    // (i'm imagining here if an event is processed twice simultaneously as I add a new bridgeable,
    // then possibly one process may archive and one may put it somewhere else (HOLD/PROC&MCHN)
    // to be consistent with this, if i put something in PROC&MCHN or something in HOLD i should delete from ARCV)
    const atom = kv.atomic()
    const fn = atom
        .check( // verify that param isn't in HOLD or DONE
            { key: ['HOLD', hash], versionstamp: null },
            { key: ['DONE', hash], versionstamp: null }
        )
        .delete(['PROC', hash]) // delete from PROC
        .delete(['MCHN', DZHV_MACHINE_ID, hash]) // delete from MCHN
        .set(['ARCV', hash], param) // add to ARCV
        .commit
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Archiving param ${paramLogId}`)
    await rlb.regulate({ fn: fn.bind(atom), args: [] })
    // log errors
    .catch(reason => console.error(new Error(reason)))
    
}