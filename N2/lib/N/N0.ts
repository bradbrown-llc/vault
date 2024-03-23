/// <reference types="../chainlist/.d.ts" />
import EJRA from '../EJR/EJRA.ts'

type Split<S extends string, D extends string> =
    S extends `${infer N}${D}${infer M}` ? [N, M] : never
    
let foo = [String, BigInt, Boolean] as const
type far = typeof foo[number]

// let bar: ReturnType<typeof foo[0]>
// let baz: ReturnType<typeof foo[1]>
// let boo: [ReturnType<typeof foo[0]>, ReturnType<typeof foo[1]>]
// type far = keyof Array<unknown>
// type goo = Omit<typeof foo, far>
// type faz = {
//     [k in keyof goo]: readonly ReturnType<goo[k]>
// }




type PartialChainOmitRpcChainId = Omit<Partial<Chain>, 'rpc'|'chainId'>
interface PartialChainNeverRpcChainId extends PartialChainOmitRpcChainId { rpc?: never, chainId?: never }

interface N0 extends PartialChainOmitRpcChainId, IEJRA { url: string }
class N0 {

    constructor({ url, ...optionals } : { url: string } & PartialChainNeverRpcChainId) {
        Object.assign((this.url = url, this), optionals)
        // Object.defineProperties(this,
        //     Object.entries(EJRA).reduce((o, [M]) => (
                
        //     , o), {})
        // )
    }

    static spawn() {
        return new N0({ url: 'http://foo.bar/baz' })
    }
    
}

export default N0