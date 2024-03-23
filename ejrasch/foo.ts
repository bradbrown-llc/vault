import err from './err.ts'
import val from './val.ts'
import * as schs from './schs/index.ts'

const block = {
    number: '0x123',
    hash: '0x1234567812345678123456781234567812345678123456781234567812345678',
    parentHash: '0x1234567812345678123456781234567812345678123456781234567812345678',
    nonce: '0x123',
    sha3Uncles: '0x1234567812345678123456781234567812345678123456781234567812345678',
    logsBloom: '0x00',
    transactionsRoot: '0x1234567812345678123456781234567812345678123456781234567812345678',
    stateRoot: '0x1234567812345678123456781234567812345678123456781234567812345678',
    receiptsRoot: '0x1234567812345678123456781234567812345678123456781234567812345678',
    miner: '0x1234567812345678123456781234567812345678',
    difficulty: '0x1',
    totalDifficulty: '0x1',
    extraData: '0x',
    size: '0x0',
    gasLimit: '0x12000',
    gasUsed: '0x11000',
    timestamp: '0x123',
    transactions: [{
        blockHash: '0x1234567812345678123456781234567812345678123456781234567812345678',
        blockNumber: '0x123',
        from: '0x1234567812345678123456781234567812345678',
        gas: '0x123',
        gasPrice: '0x123',
        hash: '0x1234567812345678123456781234567812345678123456781234567812345678',
        input: '0x',
        nonce: '0x1',
        to: '0x1234567812345678123456781234567812345678',
        transactionIndex: '0x1',
        value: '0x0',
        v: '0x1',
        r: '0x2',
        s: '0x3'
    }],
    uncles: []
} as unknown

type Block = { foo: 'bar' }

if (val<Block>(block, schs.blockByHash)) {

}