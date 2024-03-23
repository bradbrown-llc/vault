// DATA == string

type Tag = bigint|'latest'|'earliest'|'pending'
interface OptTx {
    from?: string
    to?: string
    gas?: bigint
    gasPrice?: bigint
    value?: bigint
    input?: string
    nonce?: bigint
}
interface SendTx extends OptTx { from: string, input: string }
interface CallTx extends OptTx { to: string }
interface BlockFullTx {
    number: bigint|null
    hash: string|null
    parentHash: string
    nonce: string|null
    sha3Uncles: string
    logsBloom: string
    transactionsRoot: string
    stateRoot: string
    receiptsRoot: string
    miner: string
    difficulty: bigint
    totalDifficulty: bigint
    extraData: string
    size: bigint
    gasLimit: bigint
    gasUsed: bigint
    timestamp: bigint
    transactions: FullTx[]
    uncles: BlockOmitTx[]
}
interface BlockHashTx extends Omit<BlockFullTx, 'transactions'> { transactions: string[] }
type BlockOmitTx = Omit<BlockFullTx, 'transactions'>
interface FullTx {
    blockHash: string|null
    blockNumber: bigint|null
    from: string
    gas: bigint
    gasPrice: bigint
    hash: string
    input: string
    nonce: bigint
    to: string|null
    transactionIndex: bigint|null
    value: bigint
    v: bigint
    r: bigint
    s: bigint
}
interface Receipt {
    transactionHash: string
    transactionIndex: bigint
    blockHash: string
    blockNumber: bigint
    from: string
    to: string|null
    cumulativeGasUsed: bigint
    effectiveGasPrice: bigint
    gasUsed: bigint
    contractAddress: string|null
    logs: Log[]
    logsBloom: string
    type: '0x0'|'0x1'|'0x2'
    status: 0|1
}
interface Filter {
    fromBlock: Tag
    ToBlock: Tag
    address?: string
    topics?: FilterTopic[]
}
type FilterTopic = (string|null|string[])[]
interface Log {
    removed: boolean
    logIndex: bigint|null
    transactionIndex: bigint|null
    transactionHash: string|null
    blockHash: string|null
    blockNumber: bigint|null
    address: string
    data: string
    topics: string[]
}
interface SyncStatus {
    startingBlock: bigint
    currentBlock: bigint
    highestBlock: bigint
}

