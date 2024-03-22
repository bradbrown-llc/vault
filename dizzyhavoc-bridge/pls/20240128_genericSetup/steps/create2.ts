import { Signer, getCode, signRawTx } from '../../../lib/mod.ts'
import * as e from '../../../ejra/mod.ts'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { encode } from 'npm:@ethereumjs/rlp@5.0.1'

export default async function({
    session,
    nonce=0n,
    execute, traceTx, traceCall
}:{
    session:{ deployer:Signer, url:string, gasPrice:bigint, chainId:bigint }
    nonce?:bigint
    execute?:boolean, traceTx?:boolean, traceCall?:boolean
}) {
    const { deployer, url, chainId } = session
    const code = (getCode('create2/create2_20240118') as string)
        .replace(/\?D\?+/g, deployer.address.slice(2))
    const data = `0x${code}`
    const call = { input: data, from: deployer.address }
    const gasLimit = await e.estimateGas({ call }).call({ url, rlbBypass: true }) * 200n / 100n
    const tx = { signer: deployer, nonce, gasLimit, data, ...session }
    const { signedTx, hash } = signRawTx(tx)
    const address = `0x${keccak256(encode([deployer.address, nonce])).slice(-40)}`
    console.log(`deploying create2 on chainId ${chainId}`)
    const create2 = { address, hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...create2, rlbBypass: true })
        while (!await e.receipt({ ...create2 }).call({ url }));
    }
    // console.log('create2', (await e.code({ ...create2 }).call(url)).length)
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...create2 }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return create2
}