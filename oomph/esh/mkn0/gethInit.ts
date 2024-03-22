/**
 * Initialize the genesis block.
 */
export async function gethInit({
    dataDir, gethPath, killProcs, log
}:{
    dataDir:string, gethPath:string, killProcs:Set<Deno.ChildProcess>, log:boolean
}) {
    const args = [
        'init',
        '--datadir', dataDir,
        `${dataDir}/genesis.json`
    ]
    const stdin = 'null'
    const stdout = log ? 'inherit' : 'null'
    const stderr = log ? 'inherit' : 'null'
    const options = { args, stdin, stdout, stderr } as const
    const proc = new Deno.Command(gethPath,  options).spawn()
    killProcs.add(proc)
    await proc.output()
    killProcs.delete(proc)
}