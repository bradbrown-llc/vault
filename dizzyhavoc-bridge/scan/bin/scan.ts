import {
    Cache, Logger, LogLevel,
    pickChain, vouchFilter, getBurns
} from '../../internal.ts' 

Cache.set('logLevel', LogLevel.DETAIL)

/**
 * Scanner main loop
 */
while (true) {

    // pick next chain, on fail, try again
    let chain; if (!(chain = await pickChain())) continue
    Logger.info(`scanner: picked chain ${chain.chainId}`)

    // attempt to make the filter reasonable (width >= 1), on failure continue
    if (!await vouchFilter({ chain })) continue
    Logger.info(`scanner: filter vouched for chain ${chain.chainId}`)

    // get burns, on failure continue
    let burns; if (!(burns = await getBurns({ chain }))) continue
    Logger.info(`scanner: retreived ${burns.length} burns for chain ${chain.chainId}`)

    // for each burn, set the state from null to processing
    for (const burn of burns) await burn.moveState({ from: null, to: 'hold' })

}