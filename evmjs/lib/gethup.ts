import { exists } from 'https://deno.land/std@0.208.0/fs/mod.ts'
const { mkdir, watchFs, remove } = Deno

const bin = `${Deno.env.get('HOME')}/.gethup/bin`

async function gethup(opts:GethupOpts) {
    const { version, verbose } = opts
    // tag to identify identify this execution
    const tag = crypto.randomUUID().match(/[^\-]+/)
    // debug function
    function debug(message:string) { if (verbose) console.log(`[${tag}|${new Date().toISOString()}] ${message}`) }
    // path shorthands
    const path = `${bin}/${version}`
    const lock = path+'.lock'
    // make sure the bin dir exists
    debug(`making sure ${bin} exists`)
    await mkdir(bin, { recursive: true }).catch(() => {})
    // trampoline - fn - escapes with either the binary path or a lock file
    async function fn():TrampolineAsync<string|undefined> {
        debug('at trampoline start')
        debug(`checking ${path} & ${lock} existence`)
        const [pathExists, lockExists] = await Promise.all([exists(path), exists(lock)])
        debug(`pathExists ${pathExists} lockExists ${lockExists}`)
        // check if the binary exists (and no lock file exists). if so, return path
        if (pathExists && !lockExists) {
            debug(`escaping trampoline with ${path}`)
            return path
        }
        // either there is no binary or there is a lock file
        // if there is no binary
        else if (!pathExists) {
            // try to get the lock file atomically
            debug(`attempting to obtain ${lock}`)
            const code = await mkdir(lock).then(() => 1).catch(() => 0)
            debug(`code ${code}`)
            // if it worked, return undefined
            if (code) {
                debug(`escaping trampoline with ${lock}`)
                return undefined
            }
            // if it didn't, wait for an fs event on the lock and try main proc again
            else {
                debug(`waiting for ${lock} fs event`)
                for await (const _event of watchFs(lock)) {
                    debug('entering trampoline again')
                    return () => fn()
                }
            }
        }
        // if there is a lock file, wait for an fs event on the lock and try main proc again
        else {
            debug(`waiting for ${lock} fs event`)
            for await (const _event of watchFs(lock)) {
                debug('entering trampoline again')
                return () => fn()
            }
        }
    }
    // trampoline - try fn at first
    debug('first trampoline try')
    let thunk = await fn()
    // keep trying until we escape
    while (typeof thunk == 'function') {
        debug('trying trampoline again')
        thunk = await thunk()
    }
    // if we ended with a string, return it (geth binary path)
    if (typeof thunk == 'string') {
        debug(`returning ${path}`)
        return thunk
    }
    // here, thunk must be undefined and we must have successfully obtained the lock file
    // decode the below
    debug('getting geths (selectors & versions)')
    const geths = new TextDecoder().decode(
        // git ls-remote -t ... then get stdout
        (await new Deno.Command('git', { args: [
            'ls-remote', '-t', 'https://github.com/ethereum/go-ethereum']
        }).output()).stdout
    // convert output to Geth[] described above
    ).split('\n').map(line => line.split(/.{32}\trefs\/tags\//)) as Geth[]
    // get the geth specified by version
    debug('getting geth (selector & version)')
    const geth = geths.find(g => g[1] == version)
    // throw if geth is undefined
    if (!geth) throw new Error(`could not find geth version '${version}'`)
    // create the build name and stable release URL using https://geth.ethereum.org/downloads as reference
    debug('creating build name and url to get geth (archive)')
    const build = `geth-linux-amd64-${geth[1].replace(/^v/, '')}-${geth[0]}`
    const url = `https://gethstore.blob.core.windows.net/builds/${build}.tar.gz`
    // spawn a tar command
    debug('spawning tar')
    const tar = new Deno.Command('tar', { args: [
        // rename binary from geth to version
        `--transform=s/geth$/${version}/`,
        // strip first archive directory
        '--strip-components=1',
        // output to the path variable bin
        '-C', bin,
        // extract zipped archive from stdin
        '-xzf', '-',
        // extract only the binary
        `${build}/geth`,
    ], stdin: 'piped' }).spawn()
    // spawn a wget command, getting the binary archive and outputting to standard output
    debug('spawning wget')
    const wget = new Deno.Command('wget', { args: [url, '-qO-'], stdout: 'piped' }).spawn()
    // pipe wget stdout to tar stdin
    debug('piping wget to tar')
    wget.stdout.pipeTo(tar.stdin)
    debug('awaiting tar execution')
    await tar.output()
    debug(`releasing ${lock}`)
    await remove(lock)
    debug(`returning ${path}`)
    return path
} 

export default gethup