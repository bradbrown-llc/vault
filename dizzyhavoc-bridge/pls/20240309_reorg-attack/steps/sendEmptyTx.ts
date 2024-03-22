import { Signer, signRawTx } from '../../../lib/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts';

export async function sendEmptyTx({
    burner, session, nonce, rlb
}:{
    burner:Signer
    session:{ url:string, gasPrice:bigint, chainId:bigint },
    nonce:bigint,
    rlb:RLB
}) {
    const { url, chainId } = session
    const call = { from: burner.address, to: burner.address }
    const gasLimit = await m.estimateGas({ tx: call, url, rlb }) * 200n / 100n
    const tx = { nonce, gasLimit, ...call, ...session }
    const { signedTx, hash } = signRawTx({ signer: burner, ...tx })
    // console.log(`sending empty tx ${chainId}`)
    const noop = { hash, ...b.sendRawTx({ data: signedTx }) }
    l.call({ url, request: noop })
    return hash
    // while (true) {
    //     const receipt = await m.receipt({ hash, url, rlb })
    //     if (receipt && receipt.status == '0x0') throw new Error('failed')
    //     if (receipt) break
    // }

}