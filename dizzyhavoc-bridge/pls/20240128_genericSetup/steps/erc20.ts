import { Signer, getCode, getC2Addr, signRawTx } from '../../../lib/mod.ts'
import * as e from '../../../ejra/mod.ts'

export default async function({
    session,
    create2, salt, nonce,
    execute, traceTx, traceCall
}:{
    session:{ deployer:Signer, destroyer:Signer, wallet:Signer, bridge:Signer, url:string, gasPrice:bigint, chainId:bigint },
    create2:{ address:string }, salt:bigint, nonce:bigint,
    execute?:boolean, traceTx?:boolean, traceCall?:boolean
}) {
    const { deployer, destroyer, wallet, bridge, url, chainId } = session
    const saltStr = salt.toString(16).padStart(64, '0')
    const code = (getCode('ERC20/ERC20_20240228_bridgeable.sol') as string)
        .replace(/\?D\?+/g, destroyer.address.slice(2))
        .replace(/\?W\?+/g, wallet.address.slice(2))
        .replace(/\?B\?+/g, bridge.address.slice(2))
    const data = `0x${saltStr}${code}`
    const call = { input: data, from: deployer.address, to: create2.address }
    const gasLimit = await e.estimateGas({ call }).call({ url, rlbBypass: true }) * 200n / 100n
    console.log(gasLimit)
    const tx = { signer: deployer, nonce, gasLimit, data, ...call, ...session }
    const { signedTx, hash } = signRawTx(tx)
    const address = getC2Addr({ salt, create2 })
    console.log(`deploying erc20 on chainId ${chainId}`)
    const erc20 = { address, hash, ...e.sendRawTx({ signedTx }) }
    if (execute) {
        e.ejrc({ url, ...erc20, rlbBypass: true })
        while (!await e.receipt({ ...erc20 }).call({ url }));
    }
    // console.log('erc20', (await e.code({ ...erc20 }).call(url)).length)
    if (traceTx) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...erc20 }).call(url), undefined, 4))
        console.log(temp)
    }
    if (traceCall) {
        const temp = Deno.makeTempFileSync()
        Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
        console.log(temp)
    }
    return erc20
}