/**
 * Cache an uncached geth.
 */
export async function save({
    wget, build, version
}:{
    wget:Deno.ChildProcess, build:string, version:string
}) {
    const cacheDir = `${Deno.env.get('HOME')}/.oomph/cache`
    const gethDir = `${cacheDir}/geth`
    await Deno.mkdir(gethDir, { recursive: true })
    const args = [
        `--transform=s/geth$/${version}/`,  // rename binary from geth to version
        '--strip-components=1',             // strip first archive dir
        '-C', gethDir,                      // output to gethDir
        '-xzf', '-',                        // extract zipped archive from stdin
        `${build}/geth`                     // extract only the binary
    ]
    const stdin = 'piped'
    const options = { args, stdin } as const
    const tar = new Deno.Command('tar', options).spawn()
    wget.stdout.pipeTo(tar.stdin)
    await tar.output()
}