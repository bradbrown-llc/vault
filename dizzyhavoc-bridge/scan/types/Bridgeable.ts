import { BridgeableFilter } from './mod.ts'

export type Bridgeable = {
    chainId:bigint
    rpcs:[string, ...string[]]
    lastUpdated:number
    filter:BridgeableFilter
    confirmations:bigint
}