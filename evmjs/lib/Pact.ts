import defaultAbiEncoder from './defaultAbiEncoder.ts'
import defaultAbiDecoder from './defaultAbiDecoder.ts'
import Csh from './Csh.ts'

type PactOpts = { csh:Csh, address:string, abi:Abi }
interface Pact extends PactOpts {
    estimateGas: { [key:string]: () => Promise<bigint> },
    data: { [key:string]: () => Promise<string> }
}
class Pact {
    constructor(opts:PactOpts) {
        // assign options from options object to this
        Object.assign(this, opts)
        // proxy handler
        const handler:ProxyHandler<Pact> = { get(target, modprop:string, receiver) {
            // if modprop is one of the PactOpts keys
            if (['csh', 'address', 'abi', 'receipt', 'slot', 'send'].includes(modprop))
                return target[modprop as keyof PactOpts]
            // voodoo, allows modifiers to contract interactions
            if (['data', 'estimateGas'].includes(modprop))
                return new Proxy(receiver, { get(target, property2:string) { return target[`${property2}|${modprop}`] } })
            // at this point, modprop may have a modifier, this line isolates the modprop into a property and modifier
            const [property, modifier] = modprop.split('|')
            // enter an async context, we'll be having a lot of awaits
            // no fucking around this time, args and overrides are obviously chosen
            return async ({ args, override, timeout=5000 }:{ args?:unknown[], override?:Partial<Tx>, timeout?:number }={}) => {
                // if there's no abi, the only thing we can do is a raw send, so we shouldn't be here
                if (!target.abi) { return }
                // grab the descriptor from the abi
                const [desc] = target.abi.filter(desc => desc.type == 'function' && desc.name == property)
                // if we couldn't get the descriptor, throw
                if (!desc) throw new Error(`descriptor for prop ${property} doesn't exist on abi`)
                // extract desc type (stateMutability) and possibly the custom encoder &/ decoder path
                const { stateMutability: type, encPth, decPth } = desc
                // load custom encoder &/ decoder if applicable, cast to async, just in case 
                const encoder = encPth ? (await import(encPth)).default : defaultAbiEncoder as (abi:Abi, prop:string, ...args:unknown[]) => Promise<string>
                const decoder = decPth ? (await import(decPth)).default : defaultAbiDecoder as (abi:Abi, prop:string, ...args:unknown[]) => Promise<string>
                // get data from encoder
                const data = await encoder(target.abi, property, ...args ?? [])
                // if we have the data modifier, return the data
                if (modifier == 'data') return data
                // create an array of txs, with override
                const tx = { to: target.address, data, ...override }
                // if we have the estimateGas modifier, return the first successful estimateGas
                if (modifier == 'estimateGas') return target.csh.estimateGas(tx).first({ timeout }).catch(e => { throw e })
                // get first result from executing the interaction
                const result = type == 'view'
                    ? await target.csh.call(tx).first().catch(e => { throw e })
                    : await target.csh.stx(tx).catch(e => { throw e })
                // abiDecode result if contract interaction was of type view (remember to handle results that were errors!) 
                if (type == 'view') return await decoder(target.abi, property, result)
                // return and de-coerce
                return result
            }
        }}
        return new Proxy(this, handler)
    }
    slot(x:bigint, tag:Tag='latest') { return this.csh.storageAt(this.address, x, tag).first() }
    send() { throw new Error('Pact.send not yet implemented!') }
}

export default Pact