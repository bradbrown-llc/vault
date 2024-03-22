import { getGethVersions } from './mod.ts'
/**
 * Acquire portion of artifactGeth. Returns a wget child process, a build string, and a version string.
 */
export async function acquire(...a:unknown[]) {
    const [target] = a
    if (typeof target !== 'string') throw new Error(`invalid target ${target}`)
    const versions = await getGethVersions()
    const info = versions.find(([_commit, version]) => version == target)
    if (!info) throw new Error(`could not find geth version ${target}`)
    const [commit, version] = info
    const build = `geth-linux-amd64-${version}-${commit}`
    const url = `https://gethstore.blob.core.windows.net/builds/${build}.tar.gz`
    const args = [url, '-qO-']
    const wget = new Deno.Command('wget', { args, stdout: 'piped' }).spawn()
    return { wget, build, version }
}