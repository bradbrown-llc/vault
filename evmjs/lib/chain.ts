import { fromFileUrl } from "https://deno.land/std@0.211.0/path/from_file_url.ts";

// why isn't thing a node object
function whyNotNode(x: unknown) {
    if (!(typeof x == 'object') || x === null) return 'not real object'
    if (!('name' in x && typeof x.name == 'string')) return 'missing or invalid name'
    if (!('shortName' in x && typeof x.shortName == 'string')) return 'missing or invalid shortName'
    if (!('chain' in x && typeof x.chain == 'string')) return 'missing or invalid chain'
    if (!('chainId' in x && typeof x.chainId == 'number')) return 'missing or invalid chainId'
    if (!('networkId' in x && typeof x.networkId == 'number')) return 'missing or invalid networkId'
    if (!('infoURL' in x && typeof x.infoURL == 'string')) return 'missing or invalid infoURL'
    if (!('rpc' in x && typeof x.rpc == 'string')) return 'missing or invalid rpc'
    if (!('faucets' in x && x.faucets instanceof Array)) return 'missing or invalid faucets'
    if (!('nativeCurrency' in x && typeof x.nativeCurrency == 'object')) return 'missing or invalid nativeCurrency'
}

// why isn't thing a chain object
function whyNotChain(x: unknown) {
    if (!(typeof x == 'object') || x === null) return 'not real object'
    if (!('name' in x && typeof x.name == 'string')) return 'missing or invalid name'
    if (!('shortName' in x && typeof x.shortName == 'string')) return 'missing or invalid shortName'
    if (!('chain' in x && typeof x.chain == 'string')) return 'missing or invalid chain'
    if (!('chainId' in x && typeof x.chainId == 'number')) return 'missing or invalid chainId'
    if (!('networkId' in x && typeof x.networkId == 'number')) return 'missing or invalid networkId'
    if (!('infoURL' in x && typeof x.infoURL == 'string')) return 'missing or invalid infoURL'
    if (!('rpc' in x && x.rpc instanceof Array)) return 'missing or invalid rpc'
    if (!('faucets' in x && x.faucets instanceof Array)) return 'missing or invalid faucets'
    if (!('nativeCurrency' in x && typeof x.nativeCurrency == 'object')) return 'missing or invalid nativeCurrency'
}

// why isn't thing a chains object
function whyNotChains(x: unknown) {
    if (!(x instanceof Array)) return 'not array'
    for (const [i, y] of Object.entries(x)) if (!isChain(y)) return `index ${i} not Chain: ${y}`
}

// why isn't thing a chainsets object
function whyNotChainsets(x: unknown) {
    if (!(x instanceof Array)) return 'not array'
    for (const [i, y] of Object.entries(x)) if (!isChain(y)) return `index ${i} not array: ${y}`
    for (const [i, y] of x)
        for (const [j, z] of Object.entries(y)) if (!isChain(z)) return `index ${i},${j} not Chain: ${z}`
}

// isNode is true if no whyNotNode
function isNode(x: unknown): x is Node { return !whyNotNode(x) }

// isChain is true if no whyNotChain
function isChain(x: unknown): x is Chain { return !whyNotChain(x) }

// isChains is true if no whyNotChains
function isChains(x: unknown): x is Chain[] { return !whyNotChains(x) }

// isChainsets is true if no whyNotChainsets
function isChainsets(x: unknown): x is Chain[][] { return !whyNotChainsets(x) }

// extract Chains, telling us what's missing or invalid
const chains: Chain[] = []
// for await (const dirEntry of await Deno.readDir(`${new URL(import.meta.url).pathname.replace(/[^\/]*$/, 'ethereum-lists')}/_data/chains`)) {
const chainsDir = fromFileUrl(import.meta.resolve('../ethereum-lists/_data/chains'))
for await (const dirEntry of await Deno.readDir(chainsDir)) {
    const uint8Array = await Deno.readFile(`${chainsDir}/${dirEntry.name}`)
    const text = new TextDecoder().decode(uint8Array)
    const chain = JSON.parse(text)
    if (!isChain(chain)) throw new Error(`Invalid Chain`, { cause: `${dirEntry.name} - ${whyNotChain(chain)}: ${JSON.stringify(chain)}` })
    chain.chainId = BigInt(chain.chainId)
    chains.push(chain)
}

export { chains, whyNotNode, isNode, whyNotChain, isChain, whyNotChains, isChains, whyNotChainsets, isChainsets }