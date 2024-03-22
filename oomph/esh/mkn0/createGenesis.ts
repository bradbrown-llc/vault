import { Signer } from '../mod.ts'
/**
 * Create and write the genesis.json.
 */
export async function createGenesis({
    signers, chainId, dataDir
}:{
    signers:Signer[], chainId:bigint, dataDir:string
}) {
    const cfn = ({ address }:Signer) => [address, { balance: '1000000000000000000000000' }]
    const entries = signers.map(cfn)
    const alloc = Object.fromEntries(entries)
    const period = 0
    const clique = { period }
    const homesteadBlock = 0
    const eip150Block = 0
    const eip155Block = 0
    const eip158Block = 0
    const byzantiumBlock = 0
    const constantinopleBlock = 0
    const petersburgBlock = 0
    const istanbulBlock = 0
    const berlinBlock = 0
    const eips = { eip150Block, eip155Block, eip158Block }
    const blocks = { homesteadBlock, byzantiumBlock, constantinopleBlock, petersburgBlock, istanbulBlock, berlinBlock }
    const config = { chainId, clique, ...eips, ...blocks }
    const extraData = `0x${
        ''.padEnd(32*2, '0') // 32 byte vanity
        }${signers[0].address.slice(2) // signer
        }${''.padEnd(65*2, '0') // 65 byte proposer seal
    }` // required for clique
    const gasLimit = '0xffffff'
    const difficulty = '0x0'
    const replacer = (_:string, v:unknown) => typeof v == 'bigint' ? Number(v) : v
    const value = { alloc, config, extraData, gasLimit, difficulty }
    const genesis = JSON.stringify(value, replacer)
    const genesisPath = `${dataDir}/genesis.json`
    await Deno.writeTextFile(genesisPath, genesis)
}