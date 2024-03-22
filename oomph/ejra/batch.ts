const replacer = (_:unknown, v:unknown) => typeof v == 'bigint' ? `0x${v.toString(16)}` : v
/**
 * Prepare a batch of Ethereum JSON RPC API calls (EJRCs).
 */
export function batch<M extends string>(...[url, ...ejrcs]:[string, ...readonly { method:M, params:unknown[] }[]]) {
    // const body = ejrcs.map(({ method, params }, i) =>
    //     ({ jsonrpc: '2.0' as const, method, params, id: i })) as const
    // const headers = { 'Content-Type': 'application/json' } as const
    // const init = { body, headers, method: 'POST' } as const
    return { url, ejrcs }
}