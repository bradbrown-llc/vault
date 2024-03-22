/**
 * Remove the temporary data directory for geth if we receive a SIGINT.
 */
export async function onSigint({
    dataDir, killProcs
}:{
    dataDir:string, killProcs:Set<Deno.ChildProcess>
}) {
    while (await Deno.remove(dataDir, { recursive: true }).catch(() => 1))
    for (const proc of killProcs) proc.kill()
    console.log('')
    Deno.exit()
}  