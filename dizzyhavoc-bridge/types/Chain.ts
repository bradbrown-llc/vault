import { Filter } from '../internal.ts'

export type Chain = {
    filter:Filter
    lastUpdated:number
    chainId:bigint
}