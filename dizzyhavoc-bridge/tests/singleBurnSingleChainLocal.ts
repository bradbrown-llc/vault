import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import { ejra } from '../internal.ts'
import { Signer } from '../lib/Signer.ts'
import { mkn0 } from '../lib/mkn0.ts'
import { getCode } from '../lib/getCode.ts'
import { signRawTx } from '../lib/signRawTx.ts'

// create signers
const deployer = new Signer({ secret: Deno.env.get('DEPLOYER_SECRET') as string })
const implementer = new Signer({ secret: Deno.env.get('IMPLEMENTER_SECRET') as string })
const destroyer = new Signer({ secret: Deno.env.get('DESTROYER_SECRET') as string })
const wallet = new Signer({ secret: Deno.env.get('WALLET_SECRET') as string })
const bridge = new Signer({ secret: Deno.env.get('BRIDGE_SECRET') as string })
const burner = new Signer()
const signer = new Signer()
const signers = [signer, deployer, implementer, destroyer, wallet, burner, bridge] as const

// create node objects
const chainId = 50000n
const portStart = 50000
const node = await mkn0({ signers, chainId, portStart })
const { rpc: url } = node

// prompt with node log command
console.log(`tail -f ${node.dataDir}/.log`)
prompt('Press Enter to continue')
console.log('Continuing...')

// start node
node.start()
await node.ready

let burnerNonce = 0n
let walletNonce = 0n
let deployerNonce = 0n
const gasPrice = await ejra.methods.gasPrice({ url })

const erc20 = await (async () => {
    const data = await getCode('ERC20_Bridgeable_LOCALONLY.sol') as string
    const call = { input: data }
    const gasLimit = await ejra.methods.estimateGas({ tx: call, url })
    const { signedTx, hash } = signRawTx({ signer: deployer, nonce: deployerNonce, gasLimit, gasPrice, chainId, data })
    const address = `0x${keccak256(encode([deployer.address, deployerNonce])).slice(-40)}`
    deployerNonce++
    ejra.methods.sendRawTx({ data: signedTx, url })
    let receipt
    while (!(receipt = await ejra.methods.receipt({ hash, url })));
    while (receipt.blockNumber != await ejra.methods.height({ url }));
    return {
        address,
        async burn(dest:bigint, addr:string, val:bigint) {
            const data = `0x9eea5f66${
                    dest.toString(16).padStart(64, '0')
                }${ addr.slice(2).padStart(64, '0')
                }${ val.toString(16).padStart(64, '0')}`
            const call = { from: burner.address, input: data, to: address }
            const gasLimit = await ejra.methods.estimateGas({ tx: call, url })
            const { signedTx, hash } = signRawTx({ signer: burner, nonce: burnerNonce, gasLimit, gasPrice, chainId, data, to: address })
            burnerNonce++
            ejra.methods.sendRawTx({ data: signedTx, url })
            let receipt
            while (!(receipt = await ejra.methods.receipt({ hash, url })));
            while (receipt.blockNumber != await ejra.methods.height({ url }));
        },
        async mint(addr:string, val:bigint) {
            const data = `0x40c10f19${
                    addr.slice(2).padStart(64, '0')
                }${ val.toString(16).padStart(64, '0')}`
            const call = { from: wallet.address, input: data, to: address }
            const gasLimit = await ejra.methods.estimateGas({ tx: call, url })
            const { signedTx, hash } = signRawTx({ signer: wallet, nonce: walletNonce, gasLimit, gasPrice, chainId, data, to: address })
            walletNonce++
            ejra.methods.sendRawTx({ data: signedTx, url })
            let receipt
            while (!(receipt = await ejra.methods.receipt({ hash, url })));
            while (receipt.blockNumber != await ejra.methods.height({ url }));
        },
        async balance(addr:string) {
            const data = `0x70a08231${
                addr.slice(2).padStart(64, '0')}`
            const call = { input: data, to: address }
            return BigInt(await ejra.methods.call({ tx: call, url }))
        },
        async totalSupply() {
            const data = `0x18160ddd`
            const call = { input: data, to: address }
            return BigInt(await ejra.methods.call({ tx: call, url }))
        }
    }
})()

console.log(erc20.address)
await erc20.mint(burner.address, 1n * (10n ** 9n) * (10n ** 18n))
await erc20.burn(50001n, burner.address, 200n)