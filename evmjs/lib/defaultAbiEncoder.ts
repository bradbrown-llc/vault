import jsSha3 from 'npm:js-sha3@0.8.0'
const { keccak256 } = jsSha3

export default async (abi:Abi, name:string, ...args:unknown[]) => { await Promise.resolve()
    const desc = name == 'deploy'
        ? abi.find(desc => desc.type == 'constructor')
        : abi.find(desc => desc.name == name)
    if (!desc) throw new Error(`desc ${name} not found in abi ${JSON.stringify(abi)}`)
    if (!desc.inputs) throw new Error(`desc missing inputs: ${JSON.stringify(desc)}`)
    const types = desc.inputs.map(input => input.type)
    const encodedArgs = args.map((arg, i) => {
        const type = types[i]
        if (type.match('uint')) {
            return `${(arg as bigint).toString(16).padStart(64, '0')}`
        } else if (type.match('address')) {
            return `${(arg as string).slice(2).padStart(64, '0')}`
        } else throw new Error(`${type} not supported yet`)
    })
    const signature = `${name}(${types.join()})`
    const selector = keccak256(signature).slice(0, 8)
    return `0x${name == 'deploy' ? '' : selector}${encodedArgs.join('')}`
}