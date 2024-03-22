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
    const { deployer, url } = session
    const code = (getCode('junk/junk_20240227.sol') as string)
        .replace(/\?D\?+/g, deployer.address.slice(2))
    const data = `0x${code}`
    const call = { input: data, from: deployer.address }
    const gasLimit = await e.estimateGas({ call }).call({ url, rlbBypass: true }) * 200n / 100n
    // if (prompt(`junk_deploy gasLimit is ${gasLimit}`) != 'y') throw new Error(`junk_deploy gasLimit of ${gasLimit} not approved`)
    const tx = { signer: deployer, nonce, gasLimit, data, ...session }
    // console.log(tx)
    const { signedTx, hash } = signRawTx(tx)
    const address = `0x${keccak256(encode([deployer.address, nonce])).slice(-40)}`
    // console.log('junk_deploy', { address, hash })
    const junk_deploy = { address, hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...junk_deploy, rlbBypass: true })
        while (!await e.receipt({ ...junk_deploy }).call({ url, rlbBypass: true })) await new Promise(r => setTimeout(r, 100))
    }
    // console.log('junk_deploy', (await e.code({ ...junk_deploy }).call(url)).length)
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...junk_deploy }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return junk_deploy
}