const DATA = `${Deno.env.get('CHAINLIST_DATA') ?? new URL('./', import.meta.url).pathname}/data`

const _read = async () => {
    return JSON.parse(new TextDecoder().decode(await Deno.readFile(DATA))) as Chain[]
}

interface Options { save?:boolean }
const _fetch = async ({ save }:Options) => {
    const response = await fetch('https://chainlist.org')
    const text = await response.text()
    const match = text.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
    const chains = match?.[1] ? JSON.parse(match[1]) : undefined
    if (!chains) throw new Error(`could not get data match from chainlist.org text: ${text}`)
    if (save) await Deno.writeFile(DATA, new TextEncoder().encode(JSON.stringify(chains, undefined, 4)))
    return chains
}

class ChainList {
    static read() { return _read() }
    static fetch(o:Options={}) { return _fetch(o) }
}

export default ChainList