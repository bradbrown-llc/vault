import { Signer } from '../mod.ts'
import { createGenesis, writeKeys, onSigint, importAccounts, gethInit, geth } from './mod.ts'
import { artifactGeth } from './artifactGeth/artifactGeth.ts'
/**
 * Make and run blockchain node, returning its HTTP JSON RPC API URL.
 */
export async function mkn0({
    chainId, signers, log=false
}:{
    chainId:bigint, signers:[Signer,...Signer[]], log?:boolean
}) {
    const cacheDir = `${Deno.env.get('HOME')}/.oomph/cache`
    const gethDir = `${cacheDir}/geth`
    const gethVersion = '1.13.8'
    const gethPath = `${gethDir}/${gethVersion}`
    await artifactGeth(gethVersion)
    const dataDir = await Deno.makeTempDir()
    await createGenesis({ signers, chainId, dataDir })
    const keyPaths = await writeKeys({ signers, dataDir })
    const killProcs:Set<Deno.ChildProcess> = new Set()
    Deno.addSignalListener('SIGINT', () => onSigint({ dataDir, killProcs }))
    await importAccounts({ dataDir, keyPaths, gethPath, killProcs, log })
    await gethInit({ dataDir, gethPath, killProcs, log })
    return await geth({ dataDir, signers, gethPath, log })
}