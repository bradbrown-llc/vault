import { Signer, mkn0 } from '../../lib/mod.ts'
import * as e from '../../ejra/mod.ts'
import * as steps from './steps/mod.ts'
import * as s from '../../scan/arc/scan.ts'

// signer set up
const deployer = new Signer({ secret: Deno.env.get('DZHV_DEPLOYER_SECRET') as string })
const implementer = new Signer({ secret: Deno.env.get('DZHV_IMPLEMENTER_SECRET') as string })
const destroyer = new Signer({ secret: Deno.env.get('DZHV_DESTROYER_SECRET') as string })
const wallet = new Signer({ secret: Deno.env.get('DZHV_WALLET_SECRET') as string })

// acquire node urls
const signer = new Signer({ secret: Deno.env.get('TEST_SIGNER') as string })
const signers = [signer, deployer, implementer, destroyer, wallet]
const { url:u0 } = await mkn0({ signers })
const { url:u1 } = await mkn0({ signers })

// get chainId and gasPrice, add 15% to gasPrice, set up a session shorthand object
let [chainId0, gasPrice] = await e.ejrb({ url:u0, ejrrqs: [e.chainId(), e.gasPrice()] })
const [chainId1] = await e.ejrb({ url:u1, ejrrqs: [e.chainId()] })
gasPrice = gasPrice * 115n / 100n
const session0 = { url:u0, chainId: chainId0, gasPrice, deployer, implementer, destroyer, wallet }
const session1 = { url:u1, chainId: chainId1, gasPrice, deployer, implementer, destroyer, wallet }

// junk contracts
const junk0 = await steps.junk_deploy({ session:session0, execute: true, nonce: 0n })
const junk1 = await steps.junk_deploy({ session:session1, execute: true, nonce: 0n })

// junk burn loop
;(async () => {
    for (let i = 0n;;i++) {
        const heights = await Promise.all(Array(3).fill(0).map((_, j) => steps.junk_burn({ session:session0, junk:junk0, execute: true, nonce: i * 3n + BigInt(j) })))
        console.log(new Date().toISOString().slice(14, -1), '3x burn events, block numbers:', heights)
        await new Promise(r => setTimeout(r, 3000))
    }
})()

s.scan({ session0, junk0, session1, junk1 })
await new Promise(r => setTimeout(r, 7263))
console.log(new Date().toISOString().slice(14, -1), 'killing scanner')
s.kill.value = true
await new Promise(r => setTimeout(r, 10000))
s.kill.value = false
console.log(new Date().toISOString().slice(14, -1), 'restarting scanner')
s.scan({ session0, junk0, session1, junk1 })