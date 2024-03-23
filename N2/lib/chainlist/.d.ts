interface Bridge {
    url: string
}

interface Parent {
    bridges: Bridge[]
    chain: string
    type: string
}

interface Feature {
    name: string
}

interface ENS {
    registry: string
}

interface RPC {
    url: string
    tracking?: string
    trackingDetails?: string
    isOpenSource?: boolean
}

interface Coin {
    name: string
    symbol: string
    decimals: number
}

interface Explorer {
    name: string
    url: string
    standard: string
    icon?:  string
}

interface Chain {
    chain?: string
    chainId?: number
    chainSlug?: string
    ens?: ENS
    explorers?: Explorer[]
    faucets?: string[]
    features?: Feature[]
    icon?: string
    name?: string
    infoURL?: string
    nativeCurrency?: Coin
    networkId?: number
    parent?: Parent
    redFlags?: string[]
    rpc: RPC|RPC[]
    shortName?: string
    status?: string
    title?: string
    slip44?: number
    tvl?: number
}