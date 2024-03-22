import { Signer, mkn0 } from '../../lib/mod.ts'
import * as e from '../../ejra/mod.ts'
import * as steps from './steps/mod.ts'
import * as s from '../../scan/arc/scan.ts'
import { gpl } from '../20240128_genericSetup/execute.ts'
import { scan } from '../../scan/arc/20240303_scan.ts'
import { randomBytes } from 'npm:@noble/hashes@1.3.3/utils';
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { rlb } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
rlb.delay = 500
rlb.lim = 10

// signer set up
const deployer = new Signer({ secret: Deno.env.get('DZHV_DEPLOYER_SECRET') as string })
const implementer = new Signer({ secret: Deno.env.get('DZHV_IMPLEMENTER_SECRET') as string })
const destroyer = new Signer({ secret: Deno.env.get('DZHV_DESTROYER_SECRET') as string })
const wallet = new Signer({ secret: Deno.env.get('DZHV_WALLET_SECRET') as string })
const bridge = new Signer({ secret: Deno.env.get('DZHV_BRIDGE_SECRET') as string })
const burner = new Signer({ secret: ''.padStart(64, 'A') })

// acquire node urls
const signer = new Signer({ secret: Deno.env.get('TEST_SIGNER') as string })
const signers = [signer, deployer, implementer, destroyer, wallet, burner, bridge]
const u0 = 'http://localhost:8545'
const u1 = 'http://localhost:8546'
// const { url:u0 } = await mkn0({ signers, httpPort: 8545, chainId: 8545, log: true })
// const { url:u1 } = await mkn0({ signers, httpPort: 8546, chainId: 8546 })

// get chainId and gasPrice, set up session shorthand objects
let [chainId0, gasPrice] = await e.ejrb({ url:u0, ejrrqs: [e.chainId(), e.gasPrice()] })
const [chainId1] = await e.ejrb({ url:u1, ejrrqs: [e.chainId()] })
const session0 = { url:u0, chainId: chainId0, gasPrice, deployer, implementer, destroyer, wallet, burner, bridge }
const session1 = { url:u1, chainId: chainId1, gasPrice, deployer, implementer, destroyer, wallet, burner, bridge }

// console.log('foo')
const [{ dzhv: dzhv0 }, { dzhv: dzhv1 }] = await Promise.all([gpl(u0, burner), gpl(u1, burner)])

Deno.exit()

// console.log('bar')
;(() => scan([
    { session: session0, dzhv: dzhv0 },
    { session: session1, dzhv: dzhv1 }
]))()

;(async () => {
    while (true) {
        const to = '0x3419875b4d3bca7f3fdda2db7a476a79fd31b4fe'
        const input = `0x70a08231${burner.address.substring(2).padStart(64, '0')}`
        const tx = { input, to }
        await z.tuple([z.string().transform(BigInt), z.string().transform(BigInt)]).parseAsync(await Promise.all([
            e.call({ tx }).call(u0),
            e.call({ tx }).call(u1)
        ])).then(([a, b]) => {
            const burnerBalances = { [''+chainId0]: a, [''+chainId1]: b }
            console.log(JSON.stringify({ burnerBalances }, (_,v)=>typeof v=='bigint'?''+v:v))
        })
        await new Promise(r => setTimeout(r, 5000))
    }
})()

// console.log('burn loop start')
let nonce = 0n
while (true) {
    for (let i = 0n; i < 3n; i++) {
        const destination = session1.chainId
        const recipient = burner.address
        const value = BigInt(randomBytes(1).at(0) as number)
        steps.burn({ destination, recipient, value, session: { ...session0, burner }, dzhv: dzhv0, nonce: nonce++, execute: true })
    }
    await new Promise(r => setTimeout(r, 7500))
}