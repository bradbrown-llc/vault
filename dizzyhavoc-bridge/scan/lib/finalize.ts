import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import * as m from 'https://deno.land/x/ejra@0.2.2/methods/mod.ts'
import { Bridgeable } from '../types/Bridgeable.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function finalize({
    log, chain, heights, rlb
}:{
    log:Log
    chain:Bridgeable
    heights:Map<bigint,bigint>
    rlb:RLB
}) {
    
    // extract some values
    const { transactionHash:hash, blockNumber:txHeight } = log
    const { rpcs:[url], confirmations, chainId } = chain
    const paramLogId = `${hash.slice(-4)}:${chainId}`

    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Entering finalization loop for param ${paramLogId}`)

    // loop until some decision is made (result !== undefined)
    let result:boolean|undefined|null = undefined
    while (result === undefined) {
        // first get the receipt
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Finalize: checking receipt of param ${paramLogId}`)
        result = await m.receipt({ hash, url, rlb })
        .then(async receipt => {
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} Finalize: received receipt of param ${paramLogId}`)
            // if receipt is null, then the log was reorg'd, throw false to catch block
            if (!receipt) throw false
            // otherwise, get the current height (check cache first) and return if it
            const cachedHeight = heights.get(chainId)
            if (cachedHeight && cachedHeight - txHeight >= confirmations) return cachedHeight
            // if not in cache, get it the old fashioned way
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Finalize: getting height of chain ${chainId}`)
            const height = await m.height({ url, rlb })
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} Finalize: received height of chain ${chainId}`)
            return height
        })
        .then(currHeight => {
            // cache height
            heights.set(chainId, currHeight)
            // if the current height - tx height > confirmations, final decision "finalized"
            if (currHeight - txHeight >= confirmations) {
                if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Param ${paramLogId} finalization confirmed, decision true`)
                return true
            }
            // otherwise return undefined AKA no decision made yet
            return undefined
        })
        .catch(reason => {
            // if the reason here is 'false', then that means a reorg happened, final decision "will never be finalized"
            if (reason === false) {
                if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Param ${paramLogId} reorg detected, finalization decision false`)
                return reason as false
            }
            // otherwise, we're here because of some error. log the error
            console.error(new Error(reason))
            // and return null, final decision "cannot be determined at this time, giving up"
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Param ${paramLogId} finalization could not be determined, decision null`)
            return null 
        })
    }

    // return result
    return result

    // consequences of finalization failure
    // - none, as memory, KV, and EVM are unchanged here

}