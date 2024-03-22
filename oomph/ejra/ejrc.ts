import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
const replacer = (_:unknown, v:unknown) => typeof v == 'bigint' ? `0x${v.toString(16)}` : v
const result = z.unknown()
const message = z.string()
const error = z.object({ message }).optional()
const jrrs = z.object({ result, error })
/**
 * Call on an EVM node with a URL and an Ethereum JSON RPC API call (EJRRQ).
 * 
 * @example
 * ```ts
 * import { ejrc, height } from 'https://deno.land/x/oomph@$MODULE_VERSION/ejra/mod.ts'
 * 
 * const url = 'https://rpc.ankr.com/eth'
 * const { ejrrq } = height()
 * await ejrc({ url, ejrrq }) // 19137826n
 * ```
 */
export async function ejrc<
    E extends { method:string, params?:P, schema:S },
    P extends readonly unknown[],
    S extends z.ZodTypeAny
>({ url, ejrrq: { method, params, schema } }:{ url:string, ejrrq:E }) {
    const ejrrq = { jsonrpc: '2.0', method, params: params ?? [] as const, id: 0 }
    const body = JSON.stringify(ejrrq, replacer)
    const headers = { 'Content-Type': 'application/json' } as const
    const init = { body, headers, method: 'POST' } as const
    const response = await fetch(url, init).catch(e => { throw e })
    const json = await response.json().catch(e => { throw e })
    const { result, error } = await jrrs.parseAsync(json)
    if (error) throw new Error(error.message, { cause: JSON.stringify(json) })
    return schema.parseAsync(result) as z.infer<E['schema']>
}