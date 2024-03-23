import {
    Chain, Logger, LogLevel,
    kv, kvRlb as rlb
} from '../../internal.ts'

/**
 * Update a chain and set the lastUpdated property to Date.now()
 */
export async function updateChain({ chain }:{ chain:Chain }) {

    chain.lastUpdated = Date.now()

    Logger.debug(`updateChain: requesting update for chain ${chain.chainId}`)
    const key = ['chains', chain.chainId] as const
    const update = kv.set
    await Logger.wrap(
        rlb.regulate({
            fn: update.bind(kv),
            args: [key, chain] as const
        }),
        `updateChain: failed to update chain ${chain.chainId}`,
        LogLevel.DEBUG, `udpateChain: successfully updated chain ${chain.chainId}`
    )

}