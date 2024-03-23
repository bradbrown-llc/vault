import {
    Chain, Logger, LogLevel,
    kv, kvRlb as rlb
} from '../../internal.ts'

/**
 * Iterate through the chains in Deno KV and return a list of them
 */
export async function getAllChains():Promise<Chain[]> {

    const list = kv.list<Chain>({ prefix: ['chains'] })
    const chains:Chain[] = []

    for (let i = 0;; i++) {

        Logger.debug(`getAllChains: requesting next chain, iteration ${i}`)
        const result = await Logger.wrap(
            rlb.regulate({ fn: list.next.bind(list), args: [] }),
            `getAllChains: failed to get chain, iteration ${i}`,
            LogLevel.DEBUG, `getAllChains: chain request successful, iteration ${i}`)
        if (!result || result.done) break

        const kvEntry = result.value
        const chain = kvEntry.value
        chains.push(chain)

    }

    return chains

}