import {
    Chain, Burn, Logger, LogLevel,
    updateChain, ejra, evmRlb as rlb, kvGet, machineId
} from '../../internal.ts'

/**
 * Get burn events for a chain using its filter
 */
export async function getBurns({ chain }:{ chain:Chain }):Promise<Burn[]|null> {

    const { filter } = chain
    const { fromBlock, toBlock } = filter

    let url; if(!(url = await kvGet<string>(['rpc', chain.chainId, machineId]))) return null

    // get logs
    Logger.debug(`getBurns: sending eth_getLogs on chain ${chain.chainId} with filter ${JSON.stringify(filter,(_,v)=>typeof v=='bigint'?''+v:v)}`)
    const logs = await Logger.wrap(
        ejra.methods.logs({
            filter: {
                ...filter,
                topics: ['0xe1b6e34006e9871307436c226f232f9c5e7690c1d2c4f4adda4f607a75a9beca'],
                address: '0x042229d00295309c12853fb1035f93889f97e9b1'
            },
            url,
            rlb
        }),
        `getBurns: failed to retreive logs for chain ${chain.chainId}`,
        LogLevel.DEBUG, `getBurns: successfully retrieved logs for chain ${chain.chainId}`)
    
    // if there was an error, halve the filter
    if (!logs) filter.toBlock = fromBlock + (toBlock - fromBlock) / 2n
    // on success, move the filter's fromBlock to one past the toBlock
    // this has the effect of making the next vouch call get the widest filter
    else filter.fromBlock = filter.toBlock + 1n

    // update the new filter
    await updateChain({ chain })

    // return logs mapped into burn events (or null if logs call failed)
    return logs?.map(log => Burn.from({ chain, log })) ?? null
    
}