import hash from './hash.ts'
import data from './data.ts'
import address from './address.ts'
import quantity from './quantity.ts'
const nsch = { type: 'null' } as const
export default {
    type: 'object',
    properties: {
        blockHash: { any: [nsch, hash] },
        blockNumber: { any: [nsch, quantity] },
        from: address,
        gas: quantity,
        gasPrice: quantity,
        hash: hash,
        input: data,
        nonce: quantity,
        to: { any: [nsch, address] },
        transactionIndex: { any: [nsch, quantity] },
        value: quantity,
        v: quantity,
        r: quantity,
        s: quantity,
    }
} satisfies Sch