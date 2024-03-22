/**
 * Returns information about a block by block number.
 */
export function block<T extends string, F extends boolean>(...params:[tag:T, full:F]) {
    const method = 'eth_getBlockByNumber' as const
    return { method, params }
}