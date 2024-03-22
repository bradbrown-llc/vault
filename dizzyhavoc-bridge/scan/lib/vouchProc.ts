import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import { Bridgeable, ProcParam } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

const DZHV_MAXPROC = Number(Deno.env.get('DZHV_MAXPROC'))
if (!DZHV_MAXPROC) throw new Error("missing env var 'DZHV_MAXPROC'")

export async function vouchProc({
    log, chain, kv, rlb, proc, sunPass
}:{
    log:Log
    chain:Bridgeable
    kv:Deno.Kv
    rlb:RLB
    proc:Set<string>
    heights:Map<bigint,bigint>
    sunPass?:true
}) {

    // get DZHV_MACHINE_ID env var (assume it exists since we checked at process start)
    const DZHV_MACHINE_ID = Deno.env.get('DZHV_MACHINE_ID') as string

    // extract vars
    const { transactionHash:hash } = log
    const { chainId } = chain
    const param:ProcParam = { log, chain }
    const paramLogId = `${hash.slice(-4)}:${chainId}`

    // if mem proc already has hash, return false. putting this here short circuits any KV accesses in the event of rescanned events already processing
    if (proc.has(hash)) {
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Mem proc already contains param ${paramLogId}, vouch decision false`)
        return false
    }

    // keys
    const arcvKey:Deno.KvKey = ['ARCV', hash] // <ProcParam> proc param
    const doneKey:Deno.KvKey = ['DONE', hash] // <string> tx hash
    const holdKey:Deno.KvKey = ['HOLD', hash] // <ProcParam> proc param
    const procKey:Deno.KvKey = ['PROC', hash] // <ProcParam> proc param
    const mchnKey:Deno.KvKey = ['MCHN', DZHV_MACHINE_ID, hash] // <ProcParam> proc param
    const keys = [arcvKey, doneKey, holdKey, procKey, mchnKey] as const

    // get info on this hash from KV
    // failure consequeunce: event lost - will need to rescan
    const getMany = kv.getMany<[ProcParam, true, ProcParam, ProcParam, ProcParam]>
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} vouchProc: getting KV info on param ${paramLogId}`)
    const getRes = await rlb.regulate({ fn: getMany.bind(kv), args: [keys] as const })
    // log failures
        .catch(reason => { console.error(new Error(reason)); return null })
    // if we failed to do this, return null, decision "cannot determine if we should process this"
    if (!getRes) {
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Failed to query KV for param ${paramLogId} info, vouch decision null`)
        return null
    }

    // any of the responses aren't null (exluding PROC and MCHN if sunPass is true)
    // then the hash is either processing (we know this is true for KV if sunPass is true), done, held, or archived. return false, decision "we should not process this"
    if ((sunPass ? getRes.slice(0, 3) : getRes).map(kvem => kvem.versionstamp === null).includes(false)) {

        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} vouchProc: KV already contains param ${paramLogId}, vouch decision false`)
        return false

    }

    // if hash is in mem proc
    // then the hash is processing on this machine
    // we check mem proc again here in case it was added during our KV info get.
    // it's also synchronous here with the proc.size conditional and the final proc.add, which should ensure it is only added to mem proc atomically
    if (proc.has(hash)) {

        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Mem proc already contains param ${paramLogId}, vouch decision false`)
        return false

    }

    // check proc.size vs maxProc
    if (proc.size >= DZHV_MAXPROC) {

        // attempts hold ProcParam and logs error on failure
        // failure consequence: event lost - will need to rescan
        const holdAtom = kv.atomic()
        const holdSet = holdAtom
            .check(...getRes) // check that the versions haven't changed
            .set(holdKey, param) // set param in KV HOLD
            .commit // check should guarantee that param isn't in KV
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} vouchProc: moving param ${paramLogId} to HOLD`)
        await rlb.regulate({ fn: holdSet.bind(holdAtom), args: [] as const })
            // log general errors
            .catch(reason => { console.error(new Error(reason)); return null })

        // return false, decision "do not process"
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Mem proc at max capacity, holding param ${paramLogId}, vouch decision false`)
        return false

    } else {
        
        // add hash to proc, this synchronous ordering with the size vs max conditional should ensure that proc.size doesn't exceed maxProc
        proc.add(hash)

        // verify that hash is still not in KV
        // failure consequence: event lost - will need to rescan
        const setAtom =  kv.atomic()
        const procSet = setAtom
            .check(...getRes) // make sure that the versions haven't changed (didn't somehow get added to KV without us noticing)
            .set(procKey, param) // set param in KV PROC
            .set(mchnKey, param) // set param in KV MCHN
            .commit // check should guarantee that param isn't in KV
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} vouchProc: moving param ${paramLogId} to PROC&MCHN(this)`)
        const result = await rlb.regulate({ fn: procSet.bind(setAtom), args: [] as const })
            // log general errors
            .catch(reason => { console.error(new Error(reason)); return null })
        
        // if any error (KV access or commit), delete hash from proc
        if (!result?.ok) proc.delete(hash)

        // if access error, decision "we could not determine if we should process this"
        if (result === null) {
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} KV access error while putting param ${paramLogId} in PROC, vouch decision null`)
            return null
        }

        // if commit error, decision "we should not process this"
        if (result.ok === false) {
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} KV commit error while putting param ${paramLogId} in PROC, vouch decision false`)
            console.error(new Error('vouchProc: failed to check, set, and commit'))
            return false
        }

        // otherwise, decisions "go ahead and process"
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Param ${paramLogId} ${sunPass ? 'sunPass verified' : 'put in KV PROC'}, vouch decision true`)
        return true

    }

}