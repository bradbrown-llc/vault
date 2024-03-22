import { Signer, signRawTx } from '../../../lib/mod.ts'
import * as e from '../../../ejra/mod.ts'

export default async function({
    session,
    junk, nonce=0n,
    execute, traceTx, traceCall
}:{
    session:{ implementer:Signer, url:string, gasPrice:bigint, chainId:bigint },
    junk: { address:string }, nonce?:bigint
    execute?:true, traceTx?:true, traceCall?:true
}) {
    const { implementer, url } = session
    const data = '0xbec90ced'
    const call = { input: data, from: implementer.address, to: junk.address }
    const gasLimit = await e.estimateGas({ call }).call({ url, rlbBypass: true }) * 200n / 100n
    // if (prompt(`junk_exec gasLimit is ${gasLimit}`) != 'y') throw new Error(`junk_exec gasLimit of ${gasLimit} not approved`)
    const tx = { signer: implementer, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    // console.log('junk_exec', { hash })
    const junk_exec = { hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...junk_exec, rlbBypass: true })
        let receipt
        while (!(receipt = await e.receipt({ ...junk_exec }).call({ url, rlbBypass: true })));
        return receipt.blockNumber
    }
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...junk_exec }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return junk_exec
}