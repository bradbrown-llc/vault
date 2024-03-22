import { Signer, signRawTx } from '../../../lib/mod.ts'
import * as e from '../../../ejra/mod.ts'

export default async function({
    session,
    dzhv, dies, nonce,
    execute, traceTx, traceCall, skipReceipt
}:{
    session:{ wallet?:Signer, bridge?:Signer, url:string, gasPrice:bigint, chainId:bigint },
    dzhv:{ address:string }, dies:string, nonce:bigint,
    execute?:boolean, traceTx?:boolean, traceCall?:boolean, skipReceipt?:boolean
}) {
    const { wallet, url, chainId, bridge } = session
    const minter = wallet ?? bridge
    if (!minter) throw new Error('no minter')
    const data = dies
    const call = { input: data, from: minter.address, to: dzhv.address }
    const gasLimit = await e.estimateGas({ call }).call({ url, rlbBypass: true }) * 200n / 100n
    const tx = { signer: minter, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    console.log(`minting dzhv on chainId ${chainId}`)
    const mint = { hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...mint, rlbBypass: true })
        if (!skipReceipt) while (!await e.receipt({ ...mint }).call({ url }));
    }
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...mint }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return mint
}