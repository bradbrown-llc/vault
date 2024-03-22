import { Bridgeable } from '../types/mod.ts'

const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")

const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

// fill in new active chain details here
const newBridgeables:Bridgeable[] = [
    {
        chainId: 50004n,
        rpcs: ['http://localhost:50007'],
        lastUpdated: 0,
        filter: {
            fromBlock: 0n,
            toBlock: -1n,
            address: '0x3419875B4D3Bca7F3FddA2dB7a476A79fD31B4fE',
            topics: ['0xe1b6e34006e9871307436c226f232f9c5e7690c1d2c4f4adda4f607a75a9beca']
        },
        confirmations: 0n
    },
    {
        chainId: 50000n,
        rpcs: ['http://localhost:50003'],
        lastUpdated: 0,
        filter: {
            fromBlock: 0n,
            toBlock: -1n,
            address: '0x3419875B4D3Bca7F3FddA2dB7a476A79fD31B4fE',
            topics: ['0xe1b6e34006e9871307436c226f232f9c5e7690c1d2c4f4adda4f607a75a9beca']
        },
        confirmations: 0n
    }
]

for (const newBridgeable of newBridgeables) {
    // retry the transaction until it succeeds
    let res = { ok: false }
    while (!res.ok) {
        const { chainId:id } = newBridgeable
        const key = ['bridgeable', id]
        const chainRes = await kv.get<Bridgeable>(key)
        // if chain exists do nothing
        if (chainRes.value) { console.error(new Error(`chain ${id} already bridgeable`)); break }
        // add chain
        console.log(`adding new chain ${id}`)
        res = await kv.atomic()
            .check(chainRes)
            .set(key, newBridgeable)
            .commit()
    }
}