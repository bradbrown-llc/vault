import cl from 'chainlist'
import { N0 } from 'N'

const foo = new N0({ url: 'foo' })
console.log(foo.)

// const chains = await cl.read()
// const testnets = chains.filter(({ name, title, faucets, tvl }) => `${name}${title}`.match(/test/) || (faucets.length && !tvl))
// const testnet = testnets[100]
// const { rpc, chainId: _, ...optionals } = testnet
// const n = new N0({ url: rpc[0].url, ...optionals })
// console.dir(testnet, { depth: Infinity })
// console.dir(await n.chainId, { depth: Infinity })