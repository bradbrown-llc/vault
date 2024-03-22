/**
 * Import the signer accounts.
 */
export async function importAccounts({
    dataDir, keyPaths, gethPath, killProcs, log
}:{
    dataDir:string, keyPaths:string[], gethPath:string, killProcs:Set<Deno.ChildProcess>,
    log:boolean
}) {
    const stdin = 'piped'
    const stdout = log ? 'inherit' : 'null'
    const stderr = log ? 'inherit' : 'null'
    async function cfn(keyPath:string) {
        const args = [
            '--lightkdf',
            '--datadir', dataDir,
            'account', 'import', keyPath
        ]
        const options = { args, stdin, stdout, stderr } as const
        const proc = new Deno.Command(gethPath, options).spawn()
        killProcs.add(proc)
        proc.stdin.getWriter().write(new Uint8Array([0x0a, 0x0a]))
        await proc.output()
        killProcs.delete(proc)
        await Deno.remove(keyPath)
    }
    const values = keyPaths.map(cfn)
    await Promise.all(values)
}