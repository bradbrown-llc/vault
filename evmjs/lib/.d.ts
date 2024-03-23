type Explorer = {
    name: string,
    url: string,
    standard: 'EIP3091' | 'none'
}

type Coin = {
    name: string
    symbol: string
    decimals: bigint
}

// shape source(s), may add more and combine or simplify 
// https://github.com/ethereum-lists/chains/blob/master/model/src/main/kotlin/org/ethereum/lists/chains/model/Chain.kt
type Node = {
    name: string
    shortName: string
    chain: string
    chainId: bigint
    networkId: bigint
    rpc: string
    faucets: string[]
    explorers?: Explorer[]
    infoURL: string
    title?: string
    nativeCurrency: Coin
}

type Chain = Omit<Node,'rpc'>&{ rpc:string[] }

/** @prop startingBlock - The block at which the import started (will only be reset, after the sync reached his head)
  * @prop currentBlock - The current block, same as {@link EJRA.blockNumber}
  * @prop highestBlock - The estimated highest block */
type SyncData = {
    startingBlock: string
    currentBlock: string
    highestBlock: string
}

/** @type integer block number, or the string "latest", "earliest" or "pending", see the default block parameter */
type Tag = string|bigint|'latest'|'earliest'|'pending'

/** @prop removed - true when the log was removed, due to a chain reorganization. false if its a valid log.
  * @prop logIndex -integer of the log index position in the block. null when its pending log.
  * @prop transactionIndex - integer of the transactions index position log was created from. null when its pending log.
  * @prop transactionHash - hash of the transactions this log was created from. null when its pending log.
  * @prop blockHash - hash of the block where this log was in. null when its pending. null when its pending log.
  * @prop blockNumber - the block number where this log was in. null when its pending. null when its pending log.
  * @prop address - address from which this log originated.
  * @prop data - contains zero or more 32 Bytes non-indexed arguments of the log.
  * @prop topics - Array of 0 to 4 32 Bytes DATA of indexed log arguments. (In solidity: The first topic is the hash of the signature of the event (e.g. Deposit(address,bytes32,uint256)), except you declared the event with the anonymous specifier.) */
type Log = {
    removed: boolean
    logIndex: string|null
    transactionIndex: string|null
    transactionHash: string|null
    blockHash: string|null
    blockNumber: string|null
    address: string
    data: string[]
    topics: string[]
}

/** @prop blockHash - hash of the block where this transaction was in. null when its pending.
  * @prop blockNumber - block number where this transaction was in. null when its pending.
  * @prop contractAddress - The contract address created, if the transaction was a contract creation, otherwise null.
  * @prop cumulativeGasUsed - The total amount of gas used when this transaction was executed in the block.
  * @prop data - The compiled code of a contract OR the hash of the invoked method signature and encoded parameters.
  * @prop effectiveGasPrice - The sum of the base fee and tip paid per unit of gas.
  * @prop from - The address the transaction is sent from.
  * @prop gas - Integer of the gas provided for the transaction execution. It will return unused gas.
  * @prop gasPrice - Integer of the gasPrice used for each paid gas, in Wei.
  * @prop gasUsed - The amount of gas used by this specific transaction alone.
  * @prop hash - hash of the transaction.
  * @prop logs - Array of log objects, which this transaction generated.
  * @prop logsBloom - Array of log objects, which this transaction generated.
  * @prop nonce - Integer of a nonce. This allows to overwrite your own pending transactions that use the same nonce.
  * @prop r - ECDSA signature r
  * @prop root - 32 bytes of post-transaction stateroot (pre Byzantium)
  * @prop s - ECDSA signature s
  * @prop status - either 1 (success) or 0 (failure)
  * @prop to - The address the transaction is directed to.
  * @prop transactionHash -  hash of the transaction.
  * @prop transactionIndex - integer of the transactions index position in the block. null when its pending.
  * @prop type - integer of the transaction type, 0 for legacy transactions, 1 for access list types, 2 for dynamic fees.
  * @prop v - ECDSA recovery id
  * @prop value - Integer of the value sent with this transaction, in Wei. */
type Tx = {
    blockHash: string|null
    blockNumber: string|bigint|null
    contractAddress: string|null
    cumulativeGasUsed: string|bigint
    data: string
    effectiveGasPrice: string|bigint
    from: string
    gas: string|bigint
    startGas: string|bigint
    gasPrice: string|bigint
    gasUsed: string|bigint
    hash: string
    input: string
    logs: Log[]
    logsBloom: string
    nonce: string|bigint
    r: string|bigint
    root: string
    s: string|bigint
    status: 0|1
    to: string|null
    transactionHash: string
    transactionIndex: string|bigint|null
    type: 0|1|2
    v: string|bigint
    value: string|bigint
}
type TxSign = Partial<Pick<Tx,'to'|'gas'|'gasPrice'|'value'|'nonce'>>&Pick<Tx,'from'|'data'>
type TxSend = Partial<Pick<Tx,'to'|'gas'|'gasPrice'|'value'|'nonce'>>&Pick<Tx,'from'|'input'>
type TxCall = Partial<Pick<Tx,'from'|'gas'|'gasPrice'|'value'|'input'>>&Pick<Tx,'to'>
type TxEstimateGas = Partial<TxCall>
type TxGetBy = Pick<Tx,'blockHash'|'blockNumber'|'from'|'gas'|'gasPrice'|'hash'|'input'|'nonce'|'to'|'transactionIndex'|'value'|'v'|'r'|'s'>
type TxReceipt = Pick<Tx,'transactionHash'|'transactionIndex'|'blockHash'|'blockNumber'|'from'|'to'|'cumulativeGasUsed'|'effectiveGasPrice'|'gasUsed'|'contractAddress'|'logs'|'logsBloom'|'type'|'root'|'status'>

/** @prop difficulty - integer of the difficulty for this block.
    @prop extraData - the "extra data" field of this block.
    @prop gasLimit - the maximum gas allowed in this block.
    @prop gasUsed - the total used gas by all transactions in this block.
    @prop hash - hash of the block. null when its pending block.
    @prop logsBloom - the bloom filter for the logs of the block. null when its pending block.
    @prop miner - the address of the beneficiary to whom the mining rewards were given.
    @prop nonce - hash of the generated proof-of-work. null when its pending block.
    @prop number - the block number. null when its pending block.
    @prop parentHash - hash of the parent block.
    @prop receiptsRoot - the root of the receipts trie of the block.
    @prop sha3Uncles - SHA3 of the uncles data in the block.
    @prop size - integer the size of this block in bytes.
    @prop stateRoot - the root of the final state trie of the block.
    @prop timestamp - the unix timestamp for when the block was collated.
    @prop totalDifficulty - integer of the total difficulty of the chain until this block.
    @prop transactions - Array of transaction objects, or 32 Bytes transaction hashes depending on the last given parameter.
    @prop transactionsRoot - the root of the transaction trie of the block.
    @prop uncles - Array of uncle hashes. */
type Block = {
    difficulty: string
    extraData: string
    gasLimit: string
    gasUsed: string
    hash: string|null
    logsBloom: string|null
    miner: string
    nonce: string|null
    number: string|null
    parentHash: string
    receiptsRoot: string
    sha3Uncles: string
    size: string
    stateRoot: string
    timestamp: string
    totalDifficulty: string
    transactions: Tx[]|string
    transactionsRoot: string
    uncles: string[]
}

/** @param fromBlock - see {@link Tag}
 *  @param toBlock - see {@link Tag}
 *  @param address - Contract address or a list of addresses from which logs should originate.
 *  @param topics - Array of 32 Bytes DATA topics. Topics are order-dependent. Each topic can also be an array of DATA with "or" options. */
type Filter = {
    fromBlock?: Tag
    toBlock?: Tag
    address?: string|string[]
    topics?: (null|string|string[])[]
    blockhash?: string
}
type FilterNew = Omit<Filter,'blockhash'>

interface Ejra {

    /** Returns the current client version.
      * @returns The current client version */
    clientVersion: () => Promise<string>
    
    /** Returns Keccak-256 (not the standardized SHA3-256) of the given data.
      * @param data - the data to convert into a SHA3 hash
      * @returns The SHA3 result of the given string. */
    sha3: (data:string) => Promise<string>
    
    /** Returns the current network id.
      * @returns The current network id. */
    version: () => Promise<string>
    
    /** Returns true if client is actively listening for network connections.
      * @returns true when listening, otherwise false. */
    listening: () => Promise<boolean>
    
    /** Returns number of peers currently connected to the client.
      * @returns integer of the number of connected peers. */
    peerCount: () => Promise<string>
    
    /** Returns the current Ethereum protocol version. Note that this method is not available in Geth.
      * @returns The current Ethereum protocol version */
    protocolVersion: () => Promise<string>
    
    /** Returns an object with data about the sync status or false.
      * @returns The precise return data varies between client implementations. All clients return False when the node is not syncing, and all clients return the following fields (see {@link SyncData}). The individual clients may also provide additional data. */
    syncing: () => Promise<SyncData|false>
    
    /** Returns the client coinbase address.
      * @returns the current coinbase address. */
    coinbase: () => Promise<string>
    
    /** Returns the chain ID used for signing replay-protected transactions.
      * @returns string representing the current chain id. */
    chainId: () => Promise<string>
    
    /** Returns true if client is actively mining new blocks. This can only return true for proof-of-work networks and may not be available in some clients since The Merge.
      * @returns returns true of the client is mining, otherwise false. */
    mining: () => Promise<boolean>
    
    /** Returns the number of hashes per second that the node is mining with. This can only return true for proof-of-work networks and may not be available in some clients since The Merge.
      * @returns number of hashes per second. */
    hashrate: () => Promise<string>
    
    /** Returns an estimate of the current price per gas in wei. For example, the Besu client examines the last 100 blocks and returns the median gas unit price by default.
      * @returns integer of the current gas price in wei. */
    gasPrice: () => Promise<string>
    
    /** Returns a list of addresses owned by client.
      * @returns addresses owned by the client. */
    accounts: () => Promise<string[]>
    
    /** Returns the number of most recent block.
      * @returns integer of the current block number the client is on. */
    blockNumber: () => Promise<string>
    
    /** Returns the balance of the account of given address.
      * @param address - address to check for balance.
      * @param tag - see {@link Tag}
      * @returns integer of the current balance in wei. */
    getBalance: (data:string, tag:Tag) => Promise<string>
    
    /** Returns the value from a storage position at a given address.
      * @param address - address of the storage.
      * @param slot - integer of the position in the storage.
      * @param tag - see {@link Tag}
      * @returns the value at this storage position. */
    getStorageAt: (address:string, slot:string, tag:Tag) => Promise<string>
    
    /** Returns the number of transactions sent from an address.
      * @param address - address
      * @param tag - see {@link Tag}
      * @returns integer of the number of transactions send from this address. */
    getTransactionCount: (address:string, tag:Tag) => Promise<string>
    
    /** Returns the number of transactions in a block from a block matching the given block hash.
      * @param hash - hash of a block
      * @returns integer of the number of transactions in this block. */
    getBlockTransactionCountByHash: (hash:string) => Promise<string>
    
    /** Returns the number of transactions in a block matching the given block number.
      * @param tag - see {@link Tag}
      * @returns integer of the number of transactions in this block. */
    getBlockTransactionCountByNumber: (tag:Tag) => Promise<string>
    
    /** Returns the number of uncles in a block from a block matching the given block hash.
      * @param hash - hash of a block
      * @returns integer of the number of uncles in this block. */
    getUncleCountByBlockHash: (hash:string) => Promise<string>
    
    /** Returns the number of uncles in a block from a block matching the given block number.
      * @param tag - see {@link Tag}
      * @returns integer of the number of uncles in this block. */
    getUncleCountByBlockNumber: (tag:Tag) => Promise<string>
    
    /** Returns code at a given address.
      * @param address - address
      * @param tag - see {@link Tag}
      * @returns the code from the given address. */
    getCode: (address:string, tag:Tag) => Promise<string>
    
    /** The sign method calculates an Ethereum specific signature with: sign(keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))).
      *
      * By adding a prefix to the message makes the calculated signature recognizable as an Ethereum specific signature. This prevents misuse where a malicious dapp can sign arbitrary data (e.g. transaction) and use the signature to impersonate the victim.
      *
      * Note: the address to sign with must be unlocked.
      * @param address - address
      * @param data - message to sign
      * @returns Signature */
    sign: (address:string, data:string) => Promise<string>
    
    /** Signs a transaction that can be submitted to the network at a later time using with {@link sendRawTransaction}.
      * @param tx - see {@link TxSign}
      * @returns The RLP-encoded transaction object signed by the specified account. */
    signTransaction: (tx:TxSign) => Promise<string>
    
    /** Creates new message call transaction or a contract creation, if the data field contains code, and signs it using the account specified in from.
      * @param tx - see {@link TxSend}
      * @returns the transaction hash, or the zero hash if the transaction is not yet available. */
    sendTransaction: (tx:TxSend) => Promise<string>
    
    /** Creates new message call transaction or a contract creation for signed transactions.
      * @param data - The signed transaction data.
      * @returns the transaction hash, or the zero hash if the transaction is not yet available.
      * 
      * Use {@link getTransactionReceipt} to get the contract address, after the transaction was mined, when you created a contract. */
    sendRawTransaction: (data:string) => Promise<string>
    
    /** Executes a new message call immediately without creating a transaction on the block chain. Often used for executing read-only smart contract functions, for example the balanceOf for an ERC-20 contract.
      * @ param tx - see {@link TxCall}
      * @returns the return value of executed contract. */
    call: (tx:TxCall) => Promise<string>
    
    /** Generates and returns an estimate of how much gas is necessary to allow the transaction to complete. The transaction will not be added to the blockchain. Note that the estimate may be significantly more than the amount of gas actually used by the transaction, for a variety of reasons including EVM mechanics and node performance.
      * @param tx - see {@link TxEstimateGas}
      * @returns the amount of gas used. */
    estimateGas: (tx:TxEstimateGas) => Promise<string>
    
    /** Returns information about a block by hash.
      * @param hash - Hash of a block.
      * @param full - If true it returns the full transaction objects, if false only the hashes of the transactions.
      * @returns see {@link Block} */
    getBlockByHash: (hash:string) => Promise<Block>
    
    /** Returns information about a block by block number.
      * @param tag - see {@link Tag}
      * @param full - If true it returns the full transaction objects, if false only the hashes of the transactions.
      * @returns see {@link getBlockByHash} */
    getBlockByNumber: (tag:Tag, full:boolean) => ReturnType<Ejra['getBlockByHash']>
    
    /** Returns the information about a transaction requested by transaction hash.
      * @param hash - hash of a transaction
      * @returns A transaction object (see {@link TxGetBy}), or null when no transaction was found: */
    getTransactionByHash: (hash:string) => Promise<TxGetBy|null>
    
    /** Returns information about a transaction by block hash and transaction index position.
      * @param hash - hash of a block.
      * @param index - integer of the transaction index position.
      * @returns see {@link getTransactionByHash} */
    getTransactionByBlockHashAndIndex: (hash:string, index:string) => ReturnType<Ejra['getTransactionByHash']>
    
    /** Returns information about a transaction by block number and transaction index position.
      * @param tag - see {@link Tag}
      * @param index - the transaction index position.
      * @returns see {@link getTransactionByHash} */
    getTransactionByBlockNumberAndIndex: (tag:Tag, index:string) => ReturnType<Ejra['getTransactionByHash']>
    
    /** Returns the receipt of a transaction by transaction hash.
      * @param hash - hash of a transaction
      * @returns see {@link TxReceipt} */
    getTransactionReceipt: (hash:string) => Promise<TxReceipt|null>
    
    /** Returns information about a uncle of a block by hash and uncle index position.
      * @param hash - The hash of a block
      * @param index - The uncle's index position.
      * @returns see {@link getBlockByHash} */
    getUncleByBlockHashAndIndex: (hash:string, index:string) => ReturnType<Ejra['getBlockByHash']>
    
    /** Returns information about a uncle of a block by number and uncle index position.
      * @param tag - see {@link Tag}
      * @param index - the uncle's index position.
      * @returns see {@link getBlockByHash} */
    getUncleByBlockNumberAndIndex: (tag:Tag, index:string) => ReturnType<Ejra['getBlockByHash']>
    
    /** Creates a filter object, based on filter options, to notify when the state changes (logs). To check if the state has changed, call {@link getFilterChanges}.
      *
      * A note on specifying topic filters: Topics are order-dependent. A transaction with a log with topics [A, B] will be matched by the following topic filters:
      * - [] "anything"
      * - [A] "A in first position (and anything after)"
      * - [null, B] "anything in first position AND B in second position (and anything after)"
      * - [A, B] "A in first position AND B in second position (and anything after)"
      * - [[A, B], [A, B]] "(A OR B) in first position AND (A OR B) in second position (and anything after)"
      *
      * @param filter - see {@link FilterNew}
      * @returns A filter id. */
    newFilter: (filter:FilterNew) => Promise<string>
    
    /** Creates a filter in the node, to notify when a new block arrives. To check if the state has changed, call {@link getFilterChanges}.
      * @returns A filter id. */
    newBlockFilter: () => Promise<string>
    
    /** Creates a filter in the node, to notify when new pending transactions arrive. To check if the state has changed, call {@link getFilterChanges}.
      * @returns A filter id. */
    newPendingTransactionFilter: () => Promise<string>
    
    /** Uninstalls a filter with given id. Should always be called when watch is no longer needed. Additionally Filters timeout when they aren't requested with {@link getFilterChanges} for a period of time.
      * @param id - The filter id.
      * @returns true if the filter was successfully uninstalled, otherwise false. */
    uninstallFilter: (id:string) => () => Promise<boolean>
    
    /** Polling method for a filter, which returns an array of logs which occurred since last poll.
      * @param id - the filter id.
      * @returns Array of {@link Log} objects, or an empty array if nothing has changed since last poll. */
    getFilterChanges: () => Promise<Log[]>
    
    /** Returns an array of all logs matching filter with given id.
      * @param id - The filter id.
      * @returns see {@link getFilterChanges} */
    getFilterLogs: (id:string) => ReturnType<Ejra['getFilterChanges']>
    
    /** Returns an array of all logs matching a given filter object.
      * @param filter - The filter options. See {@link Filter}
      * @returns see {@link getFilterChanges} */
    getLogs: (filter:Filter) => ReturnType<Ejra['getFilterChanges']>
    
}

type TrampolineAsync<T> = Promise<T|(() => TrampolineAsync<T>)>

type Geth = [selector:string, version:string]

type GethupOpts = { version:string, verbose?:true }

type bigintable = string|number|bigint|boolean

type Guard = (x:unknown) => boolean

/** A JsonRpcReq object. See {@link https://www.jsonrpc.org/specification#request_object |JSON-RPC 2.0 Specification - Request object} */
type JsonRpcBase = { jsonrpc:'2.0', id:number }
type JsonRpcReq = JsonRpcBase&{ method:string, params:Array<unknown> }
type JsonRpcRes = JsonRpcBase&{ result:unknown }

/** An interaction - a container representing the total lifecycle of an EVM JSON RPC call.
 *  @param req - See {@link JsonRpcReq}
 *  @param guard - A function to verify the response is valid. Of type ```(x:unknown)=>boolean```
 *  @param res - The result field of a JSON-RPC 2.0 Specification Response object
 *  @param err - An error field describing why the result field of a sent interaction could not be populated.
 *  @param pickled - An interaction that can't ever be sent. This happens if we queue many interactions then exit batching mode before sending.
 *  @param sent - An interaction that has been sent. It won't be sent again. */
type Ix = {
    req:JsonRpcReq,
    guard:Guard,
    res?:unknown,
    err?:Error,
    pickled?:true,
    sent?:true
}

type Input = {
    internalType:string
    name:string
    type:string
}

type Output = {
    internalType:string
    name:string
    type:string
}

type AbiDescriptor = {
    inputs?:Input[]
    name?:string
    outputs?:Output[]
    stateMutability:'constructor'|'view'|'nonpayable'|'payable'
    type:'function'|'constructor'|'receive'
    encPth?:string
    decPth?:string
}

type Abi = AbiDescriptor[]