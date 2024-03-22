import { fromFileUrl } from 'https://deno.land/std@0.211.0/path/from_file_url.ts'
import artifact from './artifact.ts'

export default async function () {
    const cacheDir = fromFileUrl(import.meta.resolve('../.cache'))
    const chainIdPath = `${cacheDir}/chainId`
    const lock = `${chainIdPath}.lock`
    function trigger() { return true }
    async function acquire() {
        let text = await Deno.readTextFile(chainIdPath)
        text = text === '' ? '50000' : text
        const currPort = Number(text)
        let nextPort = currPort + 4
        if (nextPort > 50039) nextPort = 50000
        await Deno.writeTextFile(chainIdPath, String(nextPort))
        return Number(text)
    }
    const chainId:{ value?:number } = {}
    function setChainId(value:number) { chainId.value = value }
    const carves = [setChainId]
    await artifact({ lock, trigger, acquire, carves })
    return chainId.value as number
}