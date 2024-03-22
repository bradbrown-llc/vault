export type BridgeableFilter = {
    fromBlock:bigint
    toBlock:bigint
    address:string
    topics:[string]
}