import { Signer } from '../mod.ts'
/**
 * Start the chain with geth.
 */
export async function geth({
    dataDir, signers, gethPath, log
}:{
    dataDir:string, signers:Signer[], gethPath:string, log:boolean
}) {
    const passwordPath = await Deno.makeTempFile({ dir: dataDir })
    const gethArgs = [
        '--datadir', dataDir,
        '--http',
        '--http.addr', '0.0.0.0',
        '--http.api', 'eth,web3,net,debug',
        '--http.corsdomain', '\\*',
        '--http.vhosts', '\\*',
        '--nat', 'none',
        '--netrestrict', '127.0.0.1/32',
        '--mine',
        '--miner.etherbase', signers[0].address,
        '--allow-insecure-unlock',
        '--unlock', signers[0].address,
        '--password', passwordPath,
        '--port', '0',
        '--http.port', '0',
        '--authrpc.port', '0'
    ]
    const tmpOutPath = await Deno.makeTempFile({ dir: dataDir })
    const args = [tmpOutPath, '--flush', '--command', `"${gethPath}" ${gethArgs.join(' ')}`]
    const script = new Deno.Command('script', { args, stdin: 'null', stderr: 'null', stdout: 'null' }).spawn()
    const tail = new Deno.Command('tail', { args: ['-f', tmpOutPath], stdout: 'piped', stderr: 'null', stdin: 'null' }).spawn()
    const { promise, resolve } = Promise.withResolvers<string>()
    ;(async () => {
        let port:string|undefined
        for await (const bytes of tail.stdout.values({ preventCancel: true })) {
            const text = new TextDecoder().decode(bytes)
            if (log) console.log(text.trim())
            port = text.match(/HTTP server started.+?:(\d+) .*?auth.*?=false/)?.[1]
            if (port) break
        }
        resolve(port as string)
    })()
    const port = await promise
    if (log) (async () => {
        for await (const bytes of tail.stdout.values({ preventCancel: true })) {
            const text = new TextDecoder().decode(bytes)
            console.log(text.trim())
        }
    })()
    const url = `http://localhost:${port}`
    return { url, script }
}