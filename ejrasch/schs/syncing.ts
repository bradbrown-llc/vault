import quantity from '../_lib/quantity.ts'
export default {
    any: [
        { type: 'boolean' },
        {
            type: 'object',
            properties: {
                startingBlock: quantity,
                currentBlock: quantity,
                highestBlock: quantity
            }
        }
    ]
} satisfies Sch