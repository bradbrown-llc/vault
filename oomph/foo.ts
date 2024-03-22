import { mkn0, Signer } from './esh/mod.ts'
import { height } from './ejra/mod.ts'
const secretEnvVarName = 'TEST_SIGNER'
const secret = Deno.env.get(secretEnvVarName)
if (!secret) throw new Error(`env var ${secretEnvVarName} empty`)
const signer = new Signer({ secret })
const [url0/*, url1*/] = (await Promise.all([
    mkn0({ signer, chainId: 8001n, log: true }),
    // mkn0({ signer, chainId: 8002n, log: true })
])).map(({ url }) => url)
console.log(await height().call(url0))

// console.log(await height().call(url1))