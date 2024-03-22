import { Bridgeable } from '../types/mod.ts'

const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")

const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

const ids:bigint[] = [
    50004n
]

for (const id of ids) {
    // retry the transaction until it succeeds
    let res = { ok: false }
    while (!res.ok) {
        const key = ['bridgeable', id]
        const chain = await kv.get<Bridgeable>(key)
        // if chain isn't bridgeable, do nothing
        if (!chain.value) { console.error(new Error(`cannot delete nonbridgeable chain ${id}`)); break }
        // otherwise delete chain
        console.log(`deleting chain ${id}`)
        res = await kv.atomic()
            .check(chain) // ensure chain hasn't changed
            .delete(key)
            .commit()
    }
}

