import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/Log.ts'
import { Bridgeable } from '../types/mod.ts'
import { getBurnDetails, vouchProc, archParam, finalize, purgeParam, holdParam, execute, loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function process({
    log, chain, evmRlb, kv, kvRlb, proc, heights, sunPass, nonces
}:{
    log:Log
    chain:Bridgeable
    evmRlb:RLB
    kv:Deno.Kv
    kvRlb:RLB
    proc:Set<string>
    heights:Map<bigint,bigint>
    sunPass?:true
    nonces:Map<bigint,bigint>
}) {

    // extract vars
    const { transactionHash:hash } = log
    const { chainId } = chain
    const paramLogId = `${hash.slice(-4)}:${chainId}`

    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Begin processing param ${paramLogId}`)

    // true if we should start processing, false if we shouldn't, null if we cannot determine, checks KV HOLD ARCH DONE PROC and mem proc for inclusion and size vs maxProc
    // failure consequence: event is potentially lost and may need to be rescanned
    const vouch = await vouchProc({ log, chain, kv, rlb: kvRlb, proc, heights, sunPass })
    // if vouch is false or null, return and stop processing
    if (!vouch) return

    // extract log details, should be [Bridgeable, string, bigint]
    const [destination, recipient, value, destChainId] = await getBurnDetails({ log, kv, rlb: kvRlb })

    // if destination is false, archive { chainId, log }
    if (destination === false) {

        // archive param
        // failure consequence: event is lost, will need to rescan
        await archParam({ log, chain, kv, rlb: kvRlb })

        // delete hash from mem proc
        proc.delete(hash)
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Param ${paramLogId} destination unbridgeable, stopping`)
        // stop
        return

    }

    // if destination is null, stop
    if (destination === null) {
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Param ${paramLogId} destination detection failed, stopping`)
        return
    }

    // get finalization
    const finalized = await finalize({ log, chain, heights, rlb: evmRlb })

    // if finalized negative
    if (!finalized) {
        // purge or hold
        await (
            finalized === false
                // if reorg, purge param
                // failure consequence: none for this iter, this is mostly an extra measure to make sure we do not process reorgs 
                ? purgeParam({ log, chain, hash: log.transactionHash, kv, rlb: kvRlb })
                // if undetermined, hold param
                // failure consequence: lose event, need rescan
                : holdParam({ log, chain, kv, rlb: kvRlb })
        )
        // delete from mem proc
        proc.delete(hash)
        // stop
        return
    }

    await execute({ log, destination, recipient, value, evmRlb, kv, kvRlb, proc, chain, nonces })

}