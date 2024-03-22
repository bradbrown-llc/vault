import { Signer, getCode, getC2Addr, signRawTx } from '../../../lib/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts';

export async function dzhv({
    session,
    create2, salt, resolver, nonce=0n,
    execute, traceTx, traceCall,
    rlb
}:{
    session:{ deployer:Signer, destroyer:Signer, url:string, gasPrice:bigint, chainId:bigint },
    create2:{ address:string }, salt:bigint, resolver:{ address:string }, nonce?:bigint
    execute?:boolean, traceTx?:boolean, traceCall?:boolean,
    rlb:RLB
}) {
    const { deployer, destroyer, url, chainId } = session
    const saltStr = salt.toString(16).padStart(64, '0')
    const code = (getCode('dzhv/dzhv_20240119') as string)
        .replace(/\?D\?+/g, destroyer.address.slice(2))
        .replace(/\?R\?+/g, resolver.address.slice(2))
    const data = `0x${saltStr}${code}`
    const call = { input: data, from: deployer.address, to: create2.address }
    const gasLimit = await m.estimateGas({ tx: call, url, rlb }) * 200n / 100n
    const tx = { signer: deployer, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    const address = getC2Addr({ salt, create2 })
    console.log(`deploying dzhv on chainId ${chainId}`)
    const dzhv = { address, hash, ...b.sendRawTx({ data: signedTx }) }
    if (execute) {
        l.call({ url, request: dzhv })
        while (true) {
            const receipt = await m.receipt({ hash, url, rlb })
            if (receipt && receipt.status == '0x0') throw new Error('failed')
            if (receipt) break
        }
    }
    // console.log('dzhv', (await e.code({ ...dzhv }).call(url)).length)
    // if (traceTx) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...dzhv }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    // if (traceCall) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    return dzhv
}