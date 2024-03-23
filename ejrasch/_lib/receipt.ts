import hash from './hash.ts'
import data from './data.ts'
import address from './address.ts'
import quantity from './quantity.ts'
import log from './log.ts'
const nsch = { type: 'null' } as const
export default {
    type: 'object',
    properties: {
        transactionHash: hash,
        transactionIndex: quantity,
        blockHash: hash,
        blockNumber: quantity,
        from: address,
        to: { any: [nsch, address] },
        cumulativeGasUsed: quantity,
        effectiveGasPrice: quantity,
        gasUsed: quantity,
        contractAddress: { any: [nsch, address] },
        logs: { type: 'array', items: [log] },
        logsBloom: data,
        type: quantity,
        status: { type: 'integer' }
    }
} satisfies Sch