import { RLB } from 'https://deno.land/x/rlb@0.0.9/mod.ts'

const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")
const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

const rlb = new RLB()
rlb.delay = 0

// get an iterator that will let us iterate through everything
const iter = kv.list<unknown>({ prefix: [] })
// loop through everything
while (true) {
    const result = await rlb.regulate({ fn: iter.next.bind(iter), args: [] })
    const kvDel = kv.delete
    // if iter is done or we get an error, break the loop
    if (!result || result.done) break
    // otherwise, delete the key
    console.log(`deleting key ${result.value.key}`)
    await rlb.regulate({ fn: kvDel.bind(kv), args: [result.value.key] as const })
}