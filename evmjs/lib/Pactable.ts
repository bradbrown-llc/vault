import Csh from './Csh.ts'

// NOTE! - we aren't implementing constructor arguments yet

type PactableOpts = { csh:Csh, bytecode:string }
interface Pactable extends PactableOpts {
    estimateGas: { deploy: () => Promise<bigint> },
    data: { deploy: () => Promise<string> }
    deploy: () => Promise<TxReceipt>
}
class Pactable {
    constructor(opts:PactableOpts) {
        Object.assign(this, opts)
        // proxy handler
        const handler:ProxyHandler<Pactable> = { get(target, modprop:string, receiver) {
            // if modprop is one of the PactOpts keys
            if (['csh', 'bytecode, abi'].includes(modprop))
                return target[modprop as keyof PactableOpts]
            // voodoo, allows modifiers to contract interactions
            if (['data', 'estimateGas'].includes(modprop))
                return new Proxy(receiver, { get(target, property2:string) { return target[`${property2}|${modprop}`] } })
            // at this point, modprop may have a modifier, this line isolates the modprop into a property and modifier
            const [property, modifier] = modprop.split('|')
            // at this point, property must be 'deploy'
            if (property !== 'deploy') throw new Error(`property ${property} invalid`)
            // enter an async context, we'll be having a lot of awaits
            // no fucking around this time, args and overrides are obviously chosen
            return ({ override, timeout=5000 }:{ override?:Partial<Tx>, timeout?:number }={ timeout: 5000 }) => {
                // data here is just the bytecode
                const data = target.bytecode
                // if we have the data modifier, return the data
                if (modifier == 'data') return data
                // create an array of txs, with override
                const tx = { data, ...override }
                // if we have the estimateGas modifier, return the first successful estimateGas
                if (modifier == 'estimateGas') return target.csh.estimateGas(tx).first({ timeout }).catch(e => { throw e })
                // return first result
                return target.csh.stx(tx)
            }
        }}
        return new Proxy(this, handler)
    }
}

export default Pactable