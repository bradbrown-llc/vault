import { Signer } from '../mod.ts'
/**
 * Write out the secrets so they can be imported.
 */
export async function writeKeys({
    signers, dataDir
}:{
    signers:Signer[], dataDir:string
}) {
    const cfn = async ({ secret }:Signer) => {
        const keyPath = await Deno.makeTempFile({ dir: dataDir })
        await Deno.writeTextFile(keyPath, secret)
        return keyPath
    }
    const values = signers.map(cfn)
    return await Promise.all(values)
}