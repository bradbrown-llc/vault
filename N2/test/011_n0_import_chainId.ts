import { N0 } from 'N2'
const n = new N0({ url: 'https://rpcapi.fantom.network' })
console.log(await n.chainId)