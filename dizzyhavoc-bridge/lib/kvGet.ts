import { Logger, LogLevel, kv, kvRlb as rlb } from '../internal.ts'

export async function kvGet<T extends unknown>(key:Deno.KvKey):Promise<T|null> {

    const get = kv.get<T>
    Logger.debug(`kvGet: sending request with kv key ${key}`)
    const result = await Logger.wrap(
        rlb.regulate({ fn: get.bind(kv), args: [key] as const }),
        `kvGet: get with kv key ${key} failed`,
        LogLevel.DEBUG, `kvGet: get with kv key ${key} succeeded`
    )
    return result?.value ?? null

}