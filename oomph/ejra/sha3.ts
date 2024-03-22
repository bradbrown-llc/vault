/**
 * Returns the sha3 of a hex string.
 */
export function sha3<M extends string>(...params:[data:M]) {
    const method = 'web3_sha3' as const
    return { method, params }
}