import { Signer, getCode, signRawTx } from '../../../lib/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts';

export async function create2({
    session,
    nonce=0n,
    execute, traceTx, traceCall,
    rlb
}:{
    session:{ deployer:Signer, url:string, gasPrice:bigint, chainId:bigint }
    nonce?:bigint
    execute?:boolean, traceTx?:boolean, traceCall?:boolean,
    rlb:RLB
}) {
    const { deployer, url, chainId } = session
    const code = (getCode('create2/create2_20240118') as string)
        .replace(/\?D\?+/g, deployer.address.slice(2))
    const data = `0x${code}`
    const call = { input: data, from: deployer.address }
    const gasLimit = await m.estimateGas({ tx: call, url, rlb }) * 200n / 100n
    const tx = { signer: deployer, nonce, gasLimit, data, ...session }
    const { signedTx, hash } = signRawTx(tx)
    const address = `0x${keccak256(encode([deployer.address, nonce])).slice(-40)}`
    console.log(`deploying create2 on chainId ${chainId}`)
    const create2 = { address, hash, ...b.sendRawTx({ data: signedTx }) }
    if (execute) {
        l.call({ url, request: create2 })
        while (true) {
            const receipt = await m.receipt({ hash, url, rlb })
            if (receipt && receipt.status == '0x0') throw new Error('failed')
            if (receipt) break
        }
    }
    // console.log('create2', (await e.code({ ...create2 }).call(url)).length)
    // if (traceTx) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...create2 }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    // if (traceCall) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    return create2
}