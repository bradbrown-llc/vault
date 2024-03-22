import { eke } from '../eke/mod.ts'
/**
 * Returns the height of a chain.
 */
export function height(...params:[]) {
    const method = 'eth_blockNumber' as const
    const call = (url:string) => eke({ url, ejrcs: [height(...params)] }).then(([x])=>x)
    return { method, params, call }
}