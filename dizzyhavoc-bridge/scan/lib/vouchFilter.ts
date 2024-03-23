import {
    Chain, Logger, LogLevel,
    updateChain, ejra, evmRlb, kvGet, machineId
} from '../../internal.ts'

/**
 * "Vouch" a filter. This ensures that the filter is at least one block wide
 * If it is less than that, return false
 * If it is at least one block wide, return true
 * If the width cannot be determined, return null
 */
export async function vouchFilter({ chain }:{ chain:Chain }) {

    // if the width of the filter is at least 1, return true
    if (chain.filter.toBlock >= chain.filter.fromBlock) return true

    let url; if(!(url = await kvGet<string>(['rpc', chain.chainId, machineId]))) return null

    // get the height of the chain
    Logger.debug(`vouchFilter: getting height of chain ${chain.chainId}`)
    const height = await Logger.wrap(
        ejra.methods.height({ url, rlb: evmRlb }),
        `vouchFilter, failed to retrieve chain ${chain.chainId} height`,
        LogLevel.DEBUG, `vouchFilter, successfully retrieved chain ${chain.chainId} height`)
    if (height === null) return null

    // if the width of the filter is at least 1
    // update filter, then chain, then return true
    if (height >= chain.filter.fromBlock) {
        chain.filter.toBlock = height
        await updateChain({ chain })
        return true
    }

    // else return false
    return false

}