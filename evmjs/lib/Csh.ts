import Nsh from './Nsh.ts'
import AIQ from './AIQ.ts'
import AbortController2 from './AbortController2.ts'
import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import jsSha3 from 'npm:js-sha3@0.9.2'
import Signer from './Signer.ts'
import { etc } from 'npm:@noble/secp256k1'
const { bytesToHex } = etc
const { keccak256 } = jsSha3

type CshOpts = { chain:Chain, signer?:Signer }
interface Csh extends Nsh, CshOpts { nshs:Nsh[] }
class Csh {
    constructor(opts:CshOpts) {
        Object.assign(this, opts)
        if (!opts.chain.rpc.length) throw 'no rpcs in chain'
        this.nshs = opts.chain.rpc.map(url => new Nsh({ url }))
        const { constructor:_, ...descriptors } = Object.getOwnPropertyDescriptors(Nsh.prototype)
        // we want every method of Nsh to be available on Csh (besides constructor)
        // where using the method uses it on every Nsh of Csh.nshs, but returns the Csh
        for (const [key, desc] of Object.entries(descriptors) as [keyof Nsh,PropertyDescriptor][]) {
            const fn = (...p:unknown[]) => { for (const nsh of this.nshs) (nsh[key] as (...p:unknown[]) => unknown)(...p); return this }
            desc.value = fn
            Object.defineProperty(this, key, desc)
        }
    }
    // get [q]ueue of [l]atest network request's ixs
    get ql() {
        const aiq = new AIQ<Ix[]>({ limit: this.nshs.length })
        for (const nsh of this.nshs) {
            const ixs:Ix[] = []
            for (const ix of nsh.ixs.toReversed())
                if (ix.req.id < (ixs.at(-1)?.req?.id ?? Infinity))
                    ixs.push(ix)
                else break
            nsh.fetches[0].then(() => aiq.push(ixs.toReversed()))
        }
        return aiq
    }
    // send and return [ [q]ueue of [l]atest network request's ixs, abort (to abort the send) ]
    sendql(o?:{ timeout?:number, unbatch?:true }) {
        const controller = new AbortController2(o)
        const signal = controller.signal2
        this.send({ signal })
        if (o?.unbatch) this.setBx(false)
        return [this.ql, () => controller.abort()] as const
    }
    // accept a folding function, then return the result of folding over sendql
    sendfold(fn:(aiq:AIQ<Ix[]>, abort:() => void) => unknown, o?:{ timeout?:number, unbatch?:true }) { return fn(...this.sendql(o)) }
    // sendfold with a folding function that returns the first result and aborts all other requests, or throws with all errors if all request failed
    first(o?:{ timeout?:number, unbatch?:true }):Promise<unknown> {
        return this.sendfold(async (aiq, abort) => {
            const errors:Error[] = []
            for await (const ixs of aiq) {
                if (ixs.every(ix => ix.res !== undefined)) { abort(); return ixs.map(ix => ix.res) }
                for (const ix of ixs) if (ix.err !== undefined) errors.push(ix.err)
            }
            throw new AggregateError(errors)
        }, o) as Promise<unknown>
    }
    // send a transaction to a chain
    async stx(tx:Partial<Tx>) {
        // get the signer, throw if there is none
        const signer = this.signer
        if (!signer) throw new Error('signer null or undefined')
        // set tx.from = signer.address
        tx.from = signer.address
        // get params from tx if they exist
        let { to, value, data, nonce, startGas, gasPrice } = tx
        // if any of [startGas, nonce, gasPrice] are undefined
        // send a batch request for all and fill in the undefined
        if ([startGas, nonce, gasPrice].includes(undefined))
            [startGas, nonce, gasPrice] = (await this.setBx(true)
                .estimateGas(tx)
                .transactionCount(signer.address, 'latest')
                .gasPrice()
                .first({ unbatch: true }).catch(e => { throw e }) as [bigint, bigint, bigint])
                .map((x, i) => [startGas, nonce, gasPrice][i] ?? x)
        // get chainId
        const chainId = this.chain.chainId
        const rawTxArray = [nonce, gasPrice, startGas, to, value, data, chainId, 0, 0]
        const rawTxEncode = encode(rawTxArray)
        const rawTxHash = keccak256(rawTxEncode)
        const { r, s, recovery: vnum } = await signer.sign(rawTxHash)
        if (vnum === undefined) throw new Error('recovery undefined')
        const v = chainId * 2n + 35n + BigInt(vnum)
        const signedTxArray = [...rawTxArray.slice(0, 6), v, r, s]
        const signedTxEthHex = `0x${bytesToHex(encode(signedTxArray))}`
        // const signedTxEthHash = `0x${keccak256(encode(signedTxArray))}`
        return this.sendRawTransaction(signedTxEthHex).first()
    }
}

export default Csh