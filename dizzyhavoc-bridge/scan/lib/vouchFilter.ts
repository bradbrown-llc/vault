import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import * as m from 'https://deno.land/x/ejra@0.2.2/methods/mod.ts'
import { Bridgeable } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function vouchFilter({
    chain, rlb
}:{
    chain:Bridgeable
    rlb:RLB
}) {

    // extract some variables
    const { filter, rpcs: [url] } = chain
    const { fromBlock, toBlock } = filter

    // if there are blocks to scan, return true
    if (toBlock >= fromBlock) return true

    // otherwise, check if there are blocks to scan by getting the most up-to-date height
    // consequence of failure: return null, chain being scanned is skipped (only if the filter is invalid)
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} vouchFilter: checking height of chain ${chain.chainId}`)
    const height = await m.height({ url, rlb })
    // log any errors getting height
        .catch(reason => { console.error(new Error(reason)); return null })

    // if height is null, we got an error, return null
    if (height === null) return null

    // if, after updating the height, there are blocks to scan, update the filter object and return true
    if (height >= fromBlock) { filter.toBlock = height; return true }

    // otherwise, return false
    return false

}