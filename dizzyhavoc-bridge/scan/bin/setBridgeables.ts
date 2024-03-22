import { Bridgeable } from '../types/mod.ts'

const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")

const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

// fill in new active chain details here
const bridgeables:Bridgeable[] = [
    {
        chainId: 50001n,
        rpcs: ['http://localhost:50011'],
        lastUpdated: 0,
        filter: {
            fromBlock: 0n,
            toBlock: -1n,
            address: '0x3419875B4D3Bca7F3FddA2dB7a476A79fD31B4fE',
            topics: ['0xe1b6e34006e9871307436c226f232f9c5e7690c1d2c4f4adda4f607a75a9beca']
        },
        confirmations: 10n
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
        confirmations: 10n
    }
]

for (const bridgeable of bridgeables) {
    // retry the transaction until it succeeds
    let res = { ok: false }
    while (!res.ok) {
        const { chainId:id } = bridgeable
        const key = ['bridgeable', id]
        const chainRes = await kv.get<Bridgeable>(key)
        // set chain
        console.log(`setting chain ${id}`)
        res = await kv.atomic()
            .check(chainRes)
            .set(key, bridgeable)
            .commit()
    }
}