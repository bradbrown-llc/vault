export default async (abi:Abi, name:string, data:string) => { await Promise.resolve()
    const desc = abi.filter(cu => cu.name == name)[0]
    if (!desc.outputs) throw new Error(`cannot decode desc ${name} as desc has no outputs: ${JSON.stringify(desc)}`)
    const types = desc.outputs.map(output => output.type)
    if (types.length > 1) throw new Error('multiple return values not supported')
    const [type] = types
    if (type.match('uint')) return BigInt(data)
    else if (type.match('string')) {
        const match = data.slice(2).match(/.{64}/g)
        if (match === null) throw new Error(`could not match data chunks of ${name} from data ${data}`)
        const offset = BigInt(`0x${match[0]}`) / 32n
        const length = BigInt(`0x${match[Number(offset)]}`)
        if (length > 32n) throw new Error(`string lengths (${length}) >32 not supported`)
        const codes = match[Number(offset + 1n)].match(/.{2}/g)
        if (codes === null) throw new Error(`could not get charCodes from data ${data}`)
        return String.fromCharCode(...codes.map(hex => parseInt(`0x${hex}`)))
    } else if (type.match('address')) return `0x${data.slice(-40)}`
    else throw new Error(`return type ${type} not supported`)
}