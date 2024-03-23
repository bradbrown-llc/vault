import { Chain, Cache, Logger, LogLevel, kv } from '../internal.ts'

await Cache.set('logLevel', LogLevel.DETAIL)

const chains:Chain[] = [
    {
        filter: {
            fromBlock: 0n,
            toBlock: -1n
        },
        lastUpdated: -Infinity,
        chainId: 50000n
    }
]

for (const chain of chains) {
    let res = { ok: false }
    while (!res.ok) {
        res = await Logger.wrap(
            kv.set(['chains', chain.chainId], chain),
            `setChains: chain ${chain.chainId} set failed`,
            LogLevel.DETAIL, `setChains: chain ${chain.chainId} set successful`
        ) ?? { ok: false }
    }
}