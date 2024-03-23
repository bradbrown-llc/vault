import { keccak256 } from 'npm:js-sha3@0.8.0'
import Pact from '../../lib/Pact.ts'

export default async (_abi:Abi, _name:string, ...pacts:Pact[]) => {
    
    // payload will be an array of the same length
    let payload = '0x0000000000000000000000000000000000000000000000000000000000000000'
    
    // SETFACET op selector
    payload = payload+'00'
    
    // add proxy length byte
    payload = payload+pacts.length.toString(16).padStart(2, '0')
    
    // add reversed proxy function length bytes
    payload = await Promise.all(payload+(await Promise.all(pacts.map(pact => pact.abi.filter(desc => desc.type == 'function').length.toString(16).padStart(2, '0')))).reverse().join(''))
    
    // add addresses and selectors
    payload = await Promise.all(payload.map(async (p, i) => p+(await Promise.all(proxies.map(async proxy => `${proxy.address[i].slice(2)}${(await proxy.abi).filter(cu => cu.type == 'function').map(cu => keccak256(`${cu.name}(${cu.inputs.map(input => input.type).join()})`).slice(0, 8)).join('')}`)))))
    
    return payload
    
}