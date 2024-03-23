import {
    Logger, LogLevel, Burn,
    ejra, evmRlb as rlb, kvGet, machineId, heights
} from '../../internal.ts'

export async function finalize(burn:Burn) {

    while (true) {

        // get the rpc url for this chain
        const url = await kvGet<string>(['rpc', burn.sourceChainId, machineId])
        if (!url) return null

        // get the confirmations for this chain
        const confirmations = await kvGet<bigint>(['confirmations', burn.sourceChainId])
        if (confirmations === null) return null

        // get the receipt for this chain
        const receipt = await Logger.wrap(
            ejra.methods.receipt({ url, hash: burn.hash, rlb }),
            `finalize: request for hash ${burn.hash.slice(-8)} receipt failed`,
            LogLevel.DEBUG, `finalize: request for hash ${burn.hash.slice(-8)} receipt succeeded`)

        // if there's no receipt, return false (re-org detected)
        if (!receipt) return false

        // get the cached height
        const cachedHeight = heights.get(burn.sourceChainId)

        // if it exists and is sufficient for finalization, return true
        if (cachedHeight && cachedHeight - receipt.blockNumber >= confirmations) return true

        // get the current height
        const height = await Logger.wrap(
            ejra.methods.height({ url, rlb }),
            `finalize: request for height of chain ${burn.sourceChainId} failed`,
            LogLevel.DEBUG, `finalize: request for height of chain ${burn.sourceChainId} succeeded`)

        // if this failed, return null. cannot determine finalization
        if (height === null) return null

        // update the local heights cache
        heights.set(burn.sourceChainId, height)

        // if the current height is sufficient for finalization, return true
        if (height - receipt.blockNumber >= confirmations) return true

        // otherwise, repeat this loop
    }

}