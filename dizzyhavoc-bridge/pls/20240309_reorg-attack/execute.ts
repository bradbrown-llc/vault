import z from 'https://deno.land/x/zod@v3.22.4/index.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import Signer from '../../lib/Signer.ts';
import { mkn0_0_0_1 } from '../../lib/mkn0_0.0.1.ts'
import * as steps from './steps/mod.ts'
import { randomBytes } from 'npm:@noble/hashes@1.3.3/utils'

const rlb = new RLB()
rlb.delay = 60
const rlb2 = new RLB()
rlb2.delay = 5000



// create signers
const deployer = new Signer({ secret: Deno.env.get('DZHV_DEPLOYER_SECRET') as string })
const implementer = new Signer({ secret: Deno.env.get('DZHV_IMPLEMENTER_SECRET') as string })
const destroyer = new Signer({ secret: Deno.env.get('DZHV_DESTROYER_SECRET') as string })
const wallet = new Signer({ secret: Deno.env.get('DZHV_WALLET_SECRET') as string })
const bridge = new Signer({ secret: Deno.env.get('DZHV_BRIDGE_SECRET') as string })
const burner = new Signer({ secret: ''.padStart(64, 'A') })
const signer = new Signer({ secret: Deno.env.get('TEST_SIGNER') as string })
const signers = [signer, deployer, implementer, destroyer, wallet, burner, bridge] as const

// create node objects
console.log('creating node objects')
const [x, y, n] = await Promise.all(Array(3).fill(0).map((_, i) =>
    mkn0_0_0_1({ signers, chainId: i < 2 ? 50000 : 50001, portStart: 50000 + i * 4 })))

// log tail instructions
console.log(`tail -f ${x.dataDir}/.log # x`)
console.log(`tail -f ${y.dataDir}/.log # y`)
console.log(`tail -f ${n.dataDir}/.log # n`)

// prompt to continue
prompt('Press Enter to continue')
console.log('Continuing...')

// set static nodes
console.log('setting nodes to sync')
x.setStaticNodes([y.enode])
y.setStaticNodes([x.enode])

// start nodes, wait until ready
console.log('waiting for nodes to be ready')
await Promise.all([x.start(), y.start(), n.start()])
await Promise.all([x.ready, y.ready, n.ready])

// build session
const [gasPrice] = await l.batch({
    url: x.rpc,
    requests: [b.height(), b.chainId()],
    rlb
})
const session0 = { gasPrice, chainId: 50000n, url: x.rpc, deployer, implementer, destroyer, wallet, bridge }
const session1 = { gasPrice, chainId: 50001n, url: n.rpc, deployer, implementer, destroyer, wallet, bridge }

const [dzhv] = await Promise.all([session0, session1].map(async (session, i) => { 
    const create2 = await steps.create2({ session, execute: true, nonce: 0n, rlb }) // deployer - create2
    const resolver = await steps.resolver({ session, create2, salt: 0n, nonce: 1n, execute: true, rlb }) // deployer - resolver
    const erc20 = await steps.erc20({ session, create2, salt: 1n, nonce: 2n, execute: true, rlb }) // deployer - erc20
    const dzhv = await steps.dzhv({ session, create2, salt: 2n, resolver, nonce: 3n, execute: true, rlb }) // deployer - dzhv
    await steps.erc20_link({ session, resolver, erc20, nonce: 0n, execute: true, rlb }) // implementer - erc20
    const foo = {
        [burner.address]: i === 0 ? 100000000000000000000000000n : 0n
    }
    const dies = `0x7e0b4201${'20'.padStart(64, '0')}${Object.values(foo).length.toString(16).padStart(64, '0')}${Object.entries(foo).map(([a, v]) => `${a.slice(2).padStart(64, '0')}${v.toString(16).padStart(64, '0')}`).join('')}`
    await steps.mint({ session, dzhv, dies, nonce: 0n, execute: true, rlb }) // wallet - mint
    return dzhv
}))

// // restart nodes - desync
// console.log('restarting nodes x y - desync')
// await Promise.all([x.stop(), y.stop()])
// x.setStaticNodes([])
// y.setStaticNodes([])
// await Promise.all([x.start(), y.start()])
// await Promise.all([x.ready, y.ready])

const to = '0x3419875b4d3bca7f3fdda2db7a476a79fd31b4fe'
const input = `0x70a08231${burner.address.substring(2).padStart(64, '0')}`
const tx = { input, to }

;(async () => {
    while (true) console.log(`burner balance on X, ${
        await m.call({ tx, url: x.rpc, rlb: rlb2 })
            .then(z.string().transform(BigInt).parseAsync)
            .catch(() => {})}`)
})()

;(async () => {
    while (true) console.log(`burner balance on N, ${
        await m.call({ tx, url: n.rpc, rlb: rlb2 })
            .then(z.string().transform(BigInt).parseAsync)
            .catch(() => {})}`)
})()

// we want to batch X burns
// const burnCount = 100n
// const burnBatch = []
// for (let i = 0; i < burnCount; i++) {
//     burnBatch.push([b.
// }
await Promise.all(Array(1000).fill(0).map((_,i) => {
    console.log(`burning nonce ${BigInt(i)} with burner on Y`)
    steps.burn({
        destination: 50001n,
        recipient: burner.address,
        value: BigInt(randomBytes(1).at(0) as number),
        session: { ...session0, burner }, dzhv, nonce: BigInt(i), execute: true,
        rlb
    })
}))

for (let nonce = 1000n; nonce < 1000n + 11n; nonce++) {
    console.log(`mining block iter ${nonce} with burner on Y`)
    const hash = await steps.sendEmptyTx({ session: { ...session0, url: y.rpc,  }, burner, nonce, rlb })
    let receipt
    while (!(receipt = await m.receipt({ hash, url: y.rpc })));
    // console.log(receipt.blockNumber)
}

// // console.log(await m.receipt({ hash: initBurnHash, url: x.rpc }))

// // submit 5 empty txs on B to ensure chains are desynced, B will reorg A, and use burner so no replay of burn
// console.log('mining 5 blocks with burner on Y')
// for (let nonce = 0n; nonce < 5n; nonce++)
//     await steps.sendEmptyTx({ session: { ...session0, url: y.rpc,  }, burner, nonce, rlb })

// // restart nodes - sync
// console.log('restarting nodes - sync')
// await Promise.all([x.stop(), y.stop()])
// x.setStaticNodes([y.enode])
// y.setStaticNodes([x.enode])
// await Promise.all([x.start(), y.start()])
// await Promise.all([x.ready, y.ready])
// console.log('nodes restarted - sync')

// console.log('waiting until reorg commits from Y to X') 
// await steps.sendEmptyTx({ session: { ...session0, url: x.rpc }, burner, nonce: 5n, rlb })

// console.log('burning on X')
// await steps.burn({
//     destination: 50001n,
//     recipient: burner.address,
//     value: BigInt(randomBytes(1).at(0) as number),
//     session: { ...session0, burner }, dzhv, nonce: 6n, execute: true,
//     rlb
// })


// console.log('mining 10 blocks with burner on Y')
// for (let nonce = 7n; nonce < 7n + 10n; nonce++)
//     await steps.sendEmptyTx({ session: { ...session0, url: y.rpc,  }, burner, nonce, rlb })