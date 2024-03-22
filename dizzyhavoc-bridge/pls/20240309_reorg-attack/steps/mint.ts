import { Signer, signRawTx } from '../../../lib/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts';

export async function mint({
    session,
    dzhv, dies, nonce,
    execute, skipReceipt,
    rlb
}:{
    session:{ wallet?:Signer, bridge?:Signer, url:string, gasPrice:bigint, chainId:bigint },
    dzhv:{ address:string }, dies:string, nonce:bigint,
    execute?:boolean, traceTx?:boolean, traceCall?:boolean, skipReceipt?:boolean,
    rlb:RLB
}) {
    const { wallet, url, chainId, bridge } = session
    const minter = wallet ?? bridge
    if (!minter) throw new Error('no minter')
    const data = dies
    const call = { input: data, from: minter.address, to: dzhv.address }
    const gasLimit = await m.estimateGas({ tx: call, url, rlb }) * 200n / 100n
    const tx = { signer: minter, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    console.log(`minting dzhv on chainId ${chainId}`)
    const mint = { hash, ...b.sendRawTx({ data: signedTx }) }
    if (execute) {
        l.call({ url, request: mint })
        if (!skipReceipt) while (true) {
            const receipt = await m.receipt({ hash, url, rlb })
            if (receipt && receipt.status == '0x0') throw new Error('failed')
            if (receipt) break
        }
    }
    // if (traceTx) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...mint }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    // if (traceCall) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    return mint
}