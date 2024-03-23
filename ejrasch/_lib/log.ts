import hash from './hash.ts'
import address from './address.ts'
import quantity from './quantity.ts'
const nsch = { type: 'null' } as const
export default {
    type: 'object',
    properties: {
        removed: { type: 'boolean' },
        logIndex: { any: [nsch, quantity] },
        transactionIndex: { any: [nsch, quantity] },
        transactionHash: { any: [nsch, hash] },
        blockHash: { any: [nsch, hash] },
        blockNumber: { any: [nsch, quantity] },
        address: address,
        data: { type: 'array', items: [hash] },
        topics: { type: 'array', items: [hash] }
    }
} satisfies Sch