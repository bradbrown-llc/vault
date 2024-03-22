/**
 * Returns an array of geth commit and version tuples.
 */
export async function getGethVersions() {
    const args = ['ls-remote', '-t', 'https://github.com/ethereum/go-ethereum']
    const command = new Deno.Command('git', { args })
    const { stdout } = await command.output()
    const text = new TextDecoder().decode(stdout)
    const lines = text.split('\n')
    const cfn = (line:string) => line.split(/.{32}\trefs\/tags\/v?/)
    return lines.map(cfn) as [commit:string, version:string][]
}