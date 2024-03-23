import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { bytesToHex } from 'npm:@noble/hashes@1.3.3/utils'
import {
    Logger, LogLevel, Burn,
    bridge, ejra, evmRlb as rlb, kvGet, machineId
} from '../internal.ts'

export class Mint {

    data:string

    constructor(data:string) {
        this.data = data
    }

    static async from(burn:Burn) {

        const url = await kvGet<string>(['rpc', burn.destinationChainId, machineId])
        if (!url) return null
            
        const to = '0x3419875b4d3bca7f3fdda2db7a476a79fd31b4fe'

        const data = `0x40c10f19${
            burn.recipient.padStart(64, '0')
            }${burn.value.toString(16).padStart(64, '0')}`

        const gasLimit = await getGasLimit(burn.destinationChainId)

        const nonce = await getNonce(burn.destinationChainId)

        const gasLimit = await Logger.wrap(
            ejra.methods.receipt({ url, hash: burn.hash, rlb }),
            `finalize: request for hash ${burn.hash.slice(-8)} receipt failed`,
            LogLevel.DEBUG, `finalize: request for hash ${burn.hash.slice(-8)} receipt succeeded`)

        const gasPrice = await Logger.wrap(
            ejra.methods.receipt({ url, hash: burn.hash, rlb }),
            `finalize: request for hash ${burn.hash.slice(-8)} receipt failed`,
            LogLevel.DEBUG, `finalize: request for hash ${burn.hash.slice(-8)} receipt succeeded`)

        const chainId = burn.destinationChainId

        const rawTxArray = [nonce, gasPrice, gasLimit, to, 0, data, chainId, 0, 0]
        const rawTxEncoding = encode(rawTxArray)
        const rawTxHash = keccak256(rawTxEncoding)
        const { r, s, recovery } = bridge.sign(rawTxHash)
        if (recovery === undefined) throw new Error('undefined recovery bit')
        const v = chainId * 2n + 35n + BigInt(recovery)
        const signedTxArray = [...rawTxArray.slice(0, 6), v, r, s]
        const signedTxBytes = encode(signedTxArray)
        const signedTx = `0x${bytesToHex(signedTxBytes)}`

        return new Mint(signedTx)

    }

}