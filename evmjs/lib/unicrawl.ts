import { chains as chains_raw } from './chain.ts'
import Csh from './Csh.ts'

const unresolvedFilters:Filter[] = []
const unresolvedTxHashes:string[][] = []
const interactors:Map<string,{ set:Set<string>, acc:bigint }> = new Map()

function doom() {
    console.log(`DOOM!`)
    Deno.exit()
}

function fId(filter:Filter) {
    const { fromBlock, toBlock } = filter 
    return `${fromBlock}..${toBlock}`
}

const push = (fl:Filter, fr?:Filter) => {
    unresolvedFilters.unshift(fl)
    if (fr) unresolvedFilters.unshift(fr)
}

function handleRes(filter:Filter, logs:Log[]) {
    console.log(`res ${fId(filter)}, logs len ${logs.length}`)
    if (logs.length) unresolvedTxHashes.push(logs.map(log => log.transactionHash).filter(hash => hash !== null) as string[])
    unresolvedFilters.splice(unresolvedFilters.findIndex(f => filter === f), 1)
}

function handleErr(filter:Filter) {
    console.log(`err ${fId(filter)}`)
    const { fromBlock, toBlock, topics } = filter as Filter&{ fromBlock:bigint, toBlock:bigint }
    if (fromBlock == toBlock) doom()
    const dl:Filter = { fromBlock, toBlock: (fromBlock + toBlock) / 2n, topics }
    const dr:Filter = { fromBlock: (fromBlock + toBlock) / 2n + 1n, toBlock, topics }
    push(dl, dr)
    unresolvedFilters.splice(unresolvedFilters.findIndex(f => filter === f), 1)
}

async function handleFilter(filter:Filter) {
    console.log(`handling ${fId(filter)}`)
    const y = await csh.logs(filter).first({ timeout: 5000 }).catch((e:AggregateError) => e) as [Log[]]|AggregateError
    if (y instanceof Error) { console.log(y); handleErr(filter) }
    else handleRes(filter, y[0])
    while (unresolvedTxHashes.length) await handleTxHashes(unresolvedTxHashes[0])
}

async function handleTxHashes(hashes:string[]) {
    console.log(`getting txs, hashes.length ${hashes.length}`)
    csh.setBx(true)
    for (const hash of hashes) csh.transactionByHash(hash)
    const txs = await (csh.sendfold(async (aiq, abort) => {
        const errors:Error[] = []
        for await (const ixs of aiq) {
            const results = []
            for (const ix of ixs) if (ix.res) results.push(ix.res); else errors.push(ix.err as Error)
            if (results.length) { abort(); return results }
        }
        throw new AggregateError(errors) // dirty
    }, { timeout: 5000 }) as Promise<unknown>).catch((e:AggregateError) => e) as Tx[]|AggregateError
    if (txs instanceof Error) {
        if (hashes.length == 1) { console.log(txs); doom() }
        const hl:string[] = hashes.slice(0, Math.floor(hashes.length / 2))
        const hr:string[] = hashes.slice(Math.floor(hashes.length / 2))
        unresolvedTxHashes.unshift(hl)
        unresolvedTxHashes.unshift(hr)
    } else {
        for (const tx of txs) handleTx(tx)
        // (interactors.get(k) as Set<string>).size
        console.log([...interactors.keys()].reduce((o:Map<string,{ len:number, val:bigint }>, k) => (o.set(k, { len: (interactors.get(k) as { set:Set<string>, acc:bigint }).set.size, val: (interactors.get(k) as { set:Set<string>, acc:bigint }).acc }), o), new Map()))
        csh.setBx(false)
    }
    unresolvedTxHashes.splice(unresolvedTxHashes.findIndex(h => hashes === h), 1)
}

function handleTx(tx:Tx) {
    if ([
        '0xe8e33700','0xf305d719','0xbaa2abde','0x02751cec',
        '0x2195995c','0xded9382a','0x38ed1739','0x8803dbee',
        '0x7ff36ab5','0x4a25d94a','0x18cbafe5','0xfb3bdb41',
        '0xaf2979eb','0x5b0d5984','0x5c11d795','0xb6f9de95',
        '0x791ac947'
    ].includes(tx.input.slice(0, 10))) {
        if (!interactors.get(tx.to as string)) interactors.set(tx.to as string, { set: new Set(), acc: 0n })
        const x = interactors.get(tx.to as string) as { set:Set<string>, acc:bigint }
        x.set.add(tx.from)
        x.acc += BigInt(tx.value as bigintable)
    }
}

chains_raw.find(chain => chain.name == 'Neon EVM MainNet')
    ?.rpc?.push(
        'https://neon-proxy-mainnet.solana.p2p.org',
        'https://neon-mainnet.everstake.one'
    )
    
chains_raw.find(chain => chain.name == 'Avalanche Fuji Testnet')
    ?.rpc?.push(
        'https://avalanche-fuji.blockpi.network/v1/rpc/public',
        'https://rpc.ankr.com/avalanche_fuji',
        'https://api.zan.top/node/v1/avax/fuji/public/ext/bc/C/rpc',
        'https://endpoints.omniatech.io/v1/avax/fuji/public',
        'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc',
    )

const chains = chains_raw
    .filter(chain => chain.rpc.filter(url => !url.match(/^ws/)).length >= 1)
    .sort((c_a, c_b) => c_b.rpc.length - c_a.rpc.length)
const chain = chains.filter(chain => chain.name.match('Avalanche Fuji Testnet')).at(0) as Chain
console.log(chain.name, chain.rpc)
const csh = new Csh({ chain })
const [height] = await csh.blockNumber().first({ timeout: 2500 }) as [bigint]
push({ fromBlock: 0n, toBlock: height, topics: ['0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'] })
while (unresolvedFilters.length) await handleFilter(unresolvedFilters[0])