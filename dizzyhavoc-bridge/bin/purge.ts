import { Cache, Logger, LogLevel, kv } from '../internal.ts' 

const list = kv.list<unknown>({ prefix: [] })

await Cache.set('logLevel', LogLevel.DEBUG)

const keys:Deno.KvKey[] = []

for (let i = 0;; i++) {
    
    const result = await Logger.wrap(
        list.next(),
        `purge: failed to request next entry, iteration ${i}`,
        LogLevel.INFO, `purge: successfully requested next entry, iteration ${i}`)
    if (result?.done) Logger.debug(`purge: entry retrieval complete, entry count ${i}`)
    if (!result || result.done) break
    const entry = result.value
    const key = entry.key
    keys.push(key)

}

const atom = kv.atomic()
for (const key of keys) atom.delete(key)
await Logger.wrap(
    atom.commit(),
    `purge: failed to commit purge`,
    LogLevel.INFO, `purge: purge successful`)