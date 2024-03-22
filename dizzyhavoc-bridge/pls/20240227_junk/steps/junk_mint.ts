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
    const data = '0xfa601ecf'
    const call = { input: data, from: implementer.address, to: junk.address }
    const gasLimit = await e.estimateGas({ call }).call({ url }) * 200n / 100n
    // if (prompt(`junk_mint gasLimit is ${gasLimit}`) != 'y') throw new Error(`junk_mint gasLimit of ${gasLimit} not approved`)
    const tx = { signer: implementer, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    // console.log('junk_mint', { hash })
    const junk_mint = { hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...junk_mint })
        // while (!await e.receipt({ ...junk_mint }).call({ url }).then(x => { /*console.log(x);*/ return x }));
    }
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...junk_mint }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return junk_mint
}