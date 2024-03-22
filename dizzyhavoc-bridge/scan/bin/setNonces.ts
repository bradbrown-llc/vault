const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")

const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

// fill in new active chain details here
const options = [
    { id: 50000n, nonce: 0n },
    { id: 50001n, nonce: 0n }
]

for (const { id, nonce } of options) {
    await kv.set(['NNCE', id], nonce)
}