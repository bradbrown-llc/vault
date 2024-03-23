export default {
    uint8: 0x00,
    mnemonic: 'ADD',
    input: ['a', 'b'],
    output: ['a + b'],
    expression: 'a + b',
    notes: '(u)int256 addition modulo 2**256',
    minGas: 3
} as const