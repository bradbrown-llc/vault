import { height, block, sha3, logs } from './ejra/mod.ts'
import { eke } from './eke/mod.ts'

const url = 'https://rpc.ankr.com/eth'
// const baz = await logs({ fromBlock: 'latest', toBlock: 'latest' }).call(url)
const baz = await eke({ url, ejrcs: [height(), sha3('0xabcd'), logs({ fromBlock: 1n, toBlock: 'latest' })]})
console.log(baz)