import { artifact } from 'https://deno.land/x/artifact@0.0.4/mod.ts'
import { acquire, save } from './mod.ts'
/**
 * Ensure geth is cached.
 */
export async function artifactGeth(target:string) {
    const cacheDir = `${Deno.env.get('HOME')}/.oomph/cache`
    const gethDir = `${cacheDir}/geth`
    const gethPath = `${gethDir}/${target}`
    const lock = `${gethPath}.lock`
    const trigger = async () => (!await Deno.stat(gethPath).catch(() => 0))
    const args = [target]
    const carves = [save]
    await artifact({ lock, trigger, acquire, args, carves })
}