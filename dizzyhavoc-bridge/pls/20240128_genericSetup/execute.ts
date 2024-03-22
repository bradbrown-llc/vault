import { Signer } from '../../lib/mod.ts'
import * as e from '../../ejra/mod.ts'
import * as steps from './steps/mod.ts'

// parameterized node url
export async function gpl(url:string, burner:Signer) {

    const foo = {
        '0xff25fe1Ed8C267392a68CC83d05Fa02e1D176d23': 100000000000000000000000000n,
        [burner.address]: 100000000000000000000000000n
    } as any
    if (url.match(/8546/)) delete foo[burner.address]
    const dies = `0x7e0b4201${'20'.padStart(64, '0')}${Object.values(foo).length.toString(16).padStart(64, '0')}${Object.entries(foo).map(([a, v]) => `${a.slice(2).padStart(64, '0')}${BigInt(v as string).toString(16).padStart(64, '0')}`).join('')}`

    // signer set up
    const deployer = new Signer({ secret: Deno.env.get('DZHV_DEPLOYER_SECRET') as string })
    const implementer = new Signer({ secret: Deno.env.get('DZHV_IMPLEMENTER_SECRET') as string })
    const destroyer = new Signer({ secret: Deno.env.get('DZHV_DESTROYER_SECRET') as string })
    const wallet = new Signer({ secret: Deno.env.get('DZHV_WALLET_SECRET') as string })
    const bridge = new Signer({ secret: Deno.env.get('DZHV_BRIDGE_SECRET') as string })


    // get chainId and gasPrice, set up a session shorthand object
    const [chainId, gasPrice] = await e.ejrb({ url, ejrrqs: [e.chainId(), e.gasPrice()] })
    const session = { url, chainId, gasPrice, deployer, implementer, destroyer, wallet, bridge }

    // create2
    const create2 = await steps.create2({ session, execute: true }) // deployer - create2
    const [resolver, erc20] = await Promise.all([
        steps.resolver({ session, create2, salt: 0n, nonce: 1n, execute: true }), // deployer - resolver
        steps.erc20({ session, create2, salt: 1n, nonce: 2n, execute: true }) // deployer - erc20
        
    ])
    const [dzhv] = await Promise.all([
        steps.dzhv({ session, create2, salt: 2n, resolver, nonce: 3n, execute: true }), // deployer - dzhv
        steps.erc20_link({ session, resolver, erc20, nonce: 0n, execute: true }) // implementer - erc20
    ])
    await steps.mint({ session, dzhv, dies, nonce: 0n, execute: true }) // wallet - mint
    
    // console.log('exit gpl')
    return { dzhv }
    
}