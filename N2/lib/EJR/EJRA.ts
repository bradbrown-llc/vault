type Foo<T> = T | T[]

let address: Foo<string> = '0x0'
let address2: Foo<string> = ['0x1','0x2','0x3']

class N2 {

    constructor(url: string) // one url
    constructor(urls: string[]) // many urls
    constructor(urlsets: string[][]) // many sets of urls
    constructor(chain: Chain) // one chain object
    constructor(chains: Chain[]) // many chain objects
    constructor(arg: string|string[]|string[][]|Chain|Chain[]) {
        // promote url from string to Chain
        if (typeof arg == 'string') arg = { rpc: [{ url: arg }] }
        // promote Chain to Chain[]
        if (!(arg instanceof Array)) arg = [arg]
        // chains is now a Chain[]
        const chains = arg
    }

}

// type
//     SY = (O as unknown) as SyncStatus

// const EJRA = {
//     web3_clientVersion: { r: 'string' },
//     web3_sha3: { P: [S], R: S },
// //     { m: 'net_version: { r: s },
// //     { m: 'net_listening: { r: b },
// //     { m: 'net_peerCount: { r: n },
// //     { m: 'eth_protocolVersion: { r: s },
// //     { m: 'eth_syncing: { r: SyncStatus|b },
// //     { m: 'eth_coinbase: { r: string },
// //     { m: 'eth_chainId: { r: string },
// //     { m: 'eth_mining: { r: boolean },
// //     { m: 'eth_hashrate: { r: bigint },
// //     { m: 'eth_gasPrice: { r: bigint },
// //     { m: 'eth_accounts: { r: string[] },
// //     { m: 'eth_blockNumber: { r: bigint },
// //     { m: 'eth_getBalance: { p: [string, Tag], r: bigint },
// //     { m: 'eth_getStorageAt: { p: [string, bigint, Tag], r: string },
// //     { m: 'eth_getTransactionCount: { p: [string, Tag], r: bigint },
// //     { m: 'eth_getBlockTransactionCountByHash: { p: [string], r: bigint },
// //     { m: 'eth_getBlockTransactionCountByNumber: { p: [Tag], r: bigint },
// //     { m: 'eth_getUncleCountByHashBlock: { p: [string], r: bigint },
// //     { m: 'eth_getUncleCountByBlockNumber: { p: [Tag], r: bigint },
// //     { m: 'eth_getCode: { p: [string, Tag], r: string },
// //     { m: 'eth_sign: { p: [string, string], r: string },
// //     { m: 'eth_signTransaction: { p: [SendTx], r: string },
// //     { m: 'eth_sendTransaction: { p: [SendTx], r: string },
// //     { m: 'eth_sendRawTransaction: { p: [string], r: string },
// //     { m: 'eth_call: { p: [CallTx, Tag], r: string },
// //     { m: 'eth_estimateGas: { p: [OptTx, Tag], r: bigint },
// //     { m: 'eth_getBlockByHash: {} as
// //     { m: '    { m: '{ p: [string, true], r: BlockFullTx | null }
// //     { m: '    { m: '| { p: [string, false], r: BlockHashTx | null },
// //     { m: 'eth_getBlockByNumber: {} as
// //     { m: '    { m: '{ p: [Tag, true], r: BlockFullTx | null }
// //     { m: '    { m: '| { p: [Tag, false], r: BlockHashTx | null },
// //     { m: 'eth_getTransactionByHash: { p: [string], r: FullTx },
// //     { m: 'eth_getTransactionByBlockHashAndIndex: { p: [string, bigint], r: FullTx },
// //     { m: 'eth_getTransactionByBlockNumberAndIndex: { p: [Tag, bigint], r: FullTx },
// //     { m: 'eth_getTransactionReceipt: { p: [string], r: Receipt | null },
// //     { m: 'eth_getUncleByBlockHashAndIndex: { p: [string, bigint], r: BlockOmitTx },
// //     { m: 'eth_getUncleByBlockNumberAndIndex: { p: [Tag, bigint], r: BlockOmitTx },
// //     { m: 'eth_newFilter: { p: [Filter], r: bigint },
// //     { m: 'eth_newBlockFilter: { r: bigint },
// //     { m: 'eth_newPendingTransactionFilter: { r: bigint },
// //     { m: 'eth_uninstallFilter: { p: [bigint], r: boolean },
// //     { m: 'eth_getFilterChanges: { p: [bigint], r: Log[] },
// //     { m: 'eth_getFilterLogs: { p: [bigint], r: Log[] },
// //     { m: 'eth_getLogs: { p: [Partial<Filter>], r: Log[] }
// } as const

// export default EJRA