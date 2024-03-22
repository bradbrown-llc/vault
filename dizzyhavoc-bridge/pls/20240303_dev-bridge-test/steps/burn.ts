import { Signer, signRawTx } from '../../../lib/mod.ts'
import * as e from '../../../ejra/mod.ts'

export default async function({
    destination, recipient, value,
    session,
    dzhv, nonce=0n,
    execute, traceTx, traceCall
}:{
    destination:bigint, recipient:string, value:bigint,
    session:{ burner:Signer, url:string, gasPrice:bigint, chainId:bigint },
    dzhv: { address:string }, nonce?:bigint
    execute?:true, traceTx?:true, traceCall?:true
}) {
    const { burner, url, chainId } = session
    const data = `0x9eea5f66${
        destination.toString(16).padStart(64, '0')}${
        recipient.substring(2).padStart(64, '0')}${
        value.toString(16).padStart(64, '0')}`
    const call = { input: data, from: burner.address, to: dzhv.address }
    const gasLimit = await e.estimateGas({ call }).call({ url, rlbBypass: true }) * 200n / 100n
    // if (prompt(`dzhv_burn gasLimit is ${gasLimit}`) != 'y') throw new Error(`dzhv_burn gasLimit of ${gasLimit} not approved`)
    const tx = { signer: burner, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    console.log(`burning dzhv on chainId ${chainId}`)
    const dzhv_burn = { hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...dzhv_burn, rlbBypass: true })
        let receipt
        while (!(receipt = await e.receipt({ ...dzhv_burn }).call({ url })));
        // console.log('RECEIPT', receipt)
        return receipt.blockNumber
    }
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...dzhv_burn }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return dzhv_burn
}