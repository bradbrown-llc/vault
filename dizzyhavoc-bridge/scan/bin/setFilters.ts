import { Bridgeable } from '../types/mod.ts'

const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")

const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

// fill in new active chain details here
const filters = [
    {
        chainId: 50001n,
        filter: {
            fromBlock: 0n,
            toBlock: -1n
        }
    },
    {
        chainId: 50000n,
        filter: {
            fromBlock: 0n,
            toBlock: -1n
        },
    }
]

for (const { chainId, filter: { fromBlock, toBlock } } of filters) {
    let res = { ok: false }
    while (!res.ok) {
        const key = ['bridgeable', chainId] as const
        // get the bridgeable
        const bridgeable = await kv.get<Bridgeable>(key)
            .catch(reason => { console.error(new Error(reason)); return null })
        if (!bridgeable?.value) continue
        bridgeable.value.filter.fromBlock = fromBlock
        bridgeable.value.filter.toBlock = toBlock
        // update the bridgeable
        res = await kv.atomic()
            .check(bridgeable)
            .set(key, bridgeable)
            .commit()
            .catch(reason => { console.error(new Error(reason)); return null })
            ?? { ok: false }
    }
    console.log(`set filter of chain ${chainId}`)
}