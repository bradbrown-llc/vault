import { Signer, signRawTx } from '../../../lib/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'

export async function burn({
    destination, recipient, value,
    session,
    dzhv, nonce=0n,
    execute, traceTx, traceCall,
    rlb
}:{
    destination:bigint, recipient:string, value:bigint,
    session:{ burner:Signer, url:string, gasPrice:bigint, chainId:bigint },
    dzhv: { address:string }, nonce?:bigint
    execute?:true, traceTx?:true, traceCall?:true,
    rlb:RLB
}) {
    const { burner, url, chainId } = session
    const data = `0x9eea5f66${
        destination.toString(16).padStart(64, '0')}${
        recipient.substring(2).padStart(64, '0')}${
        value.toString(16).padStart(64, '0')}`
    const call = { input: data, from: burner.address, to: dzhv.address }
    const gasLimit = await m.estimateGas({ tx: call, url, rlb }) * 200n / 100n
    // if (prompt(`dzhv_burn gasLimit is ${gasLimit}`) != 'y') throw new Error(`dzhv_burn gasLimit of ${gasLimit} not approved`)
    const tx = { signer: burner, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    console.log(`burning dzhv on chainId ${chainId}`)
    const dzhv_burn = { hash, ...b.sendRawTx({ data: signedTx }) }
    if (execute) {
        l.call({ url, request: { ...dzhv_burn } })
        while (true) {
            const receipt = await m.receipt({ hash, url, rlb })
            if (receipt && receipt.status == '0x0') throw new Error('failed')
            if (receipt) break
        }
    }
    // if (traceTx) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...dzhv_burn }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    // if (traceCall) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    return dzhv_burn
}