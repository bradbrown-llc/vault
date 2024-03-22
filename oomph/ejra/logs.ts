import { eke } from '../eke/mod.ts'
/**
 * Returns information about a block by block number.
 */
export function logs<F extends { fromBlock?:Tag, toBlock?:Tag, address?:string, topics?:(string|string[])[] }>(...params:[filter:F]) {
    const method = 'eth_getLogs' as const
    const call = (url:string) => eke({ url, ejrcs: [logs(...params)] }).then(([x])=>x)
    return { method, params, call }
}