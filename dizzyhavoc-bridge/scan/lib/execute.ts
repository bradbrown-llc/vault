import { encode } from 'npm:@ethereumjs/rlp@5.0.1'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3
import { bytesToHex } from 'npm:@noble/hashes@1.3.3/utils'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import * as m from 'https://deno.land/x/ejra@0.2.2/methods/mod.ts'
import Signer from '../../lib/Signer.ts'
import { Bridgeable, ProcParam } from '../types/mod.ts'
import { loglev, logstamp } from './mod.ts'

const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))

export async function execute({
    log, destination, recipient, value, evmRlb, kv, kvRlb, proc, chain, nonces
}:{
    log:Log
    destination:Bridgeable
    recipient:string
    value:bigint
    evmRlb:RLB
    kv:Deno.Kv
    kvRlb:RLB
    proc:Set<string>
    chain:Bridgeable
    nonces:Map<bigint,bigint>
}) {
    
    // get DZHV_BRIDGE_SECRET env var (assume it exists since we checked at process start)
    const DZHV_BRIDGE_SECRET = Deno.env.get('DZHV_BRIDGE_SECRET')
    if (!DZHV_BRIDGE_SECRET) throw new Error("missing env var 'DZHV_BRIDGE_SECRET'")
    const bridge = new Signer({ secret: DZHV_BRIDGE_SECRET })

    // get DZHV_MACHINE_ID env var (assume it exists since we checked at process start)
    const DZHV_MACHINE_ID = Deno.env.get('DZHV_MACHINE_ID') as string

    // extract values
    const { transactionHash:hash } = log
    const { chainId, rpcs:[url] } = destination
    const paramLogId = `${hash.slice(-4)}:${chain.chainId}`

    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Beginning execution of param ${paramLogId}`)

    // mem proc sanity check
    if (!proc.has(hash)) { console.error(new Error(`execute: proc missing hash ${hash}`)); return }

    // keys
    const arcvKey = ['ARCV', hash] // <ProcParam> proc param
    const doneKey = ['DONE', hash] // <true>
    const holdKey = ['HOLD', hash] // <ProcParam> proc param
    const procKey = ['PROC', hash] // <ProcParam> proc param
    const mchnKey = ['MCHN', DZHV_MACHINE_ID, hash] // <ProcParam> proc param
    const keys = [arcvKey, doneKey, holdKey, procKey, mchnKey] as const

    // KV param state sanity check
    // get info on this hash from KV
    const get = kv.getMany<[ProcParam, true, ProcParam, ProcParam, ProcParam]>
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Execute: getting information on param ${paramLogId}`)
    const getRes = await kvRlb.regulate({ fn: get.bind(kv), args: [keys] as const })
    // log failures
        .catch(reason => { console.error(new Error(reason)); return null })
    // if we failed to do this, return null, decision "cannot determine KV state sanity check"
    if (!getRes) return null 
    
    // mem proc sanity check 2 and KV state sanity check
    // verify param not in ARCV DONE HOLD && param in PROC and MCHN (with correct id)
    if (!proc.has(hash)) { console.error(new Error(`execute: proc missing hash ${hash}`)); return }
    if (getRes.map((kvem, i) => !!kvem.value == [false, false, false, true, true][i]).includes(false)) {
        console.error(`execute: bad kvem state check`); return } 

    // coerce to KV DONE before firing off mint
    const coerceAtom = kv.atomic()
    const coerceDone = coerceAtom
        .check(...getRes) // make sure KV param state sanity check still holds
        .delete(procKey) // delete param from PROC
        .delete(mchnKey) // delete param from MCHN
        .set(doneKey, true) // add param to DONE
        .commit
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Execute: moving ${paramLogId} to KV DONE`)
    const result = await kvRlb.regulate({ fn: coerceDone.bind(coerceAtom), args: [] as const })
        // log general errors
        .catch(reason => { console.error(new Error(reason)); return null  })

    // if general error, stop
    if (result === null) return

    // if KV DONE coersion failed, log and stop
    if (result.ok === false) { console.error(new Error('execute: KV DONE coersion failure')); return }

    // remove param from mem proc
    proc.delete(hash)

    // ### at this point KV state made sense while we transitioned param to DONE state and mem proc, everything is clear to launch

    const gasLimit = 100000n // hardcode gas estimate

    // get gasPrice
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Execute: getting gas price for param ${paramLogId} on chain ${chainId}`)
    let gasPrice = await m.gasPrice({ url, rlb: evmRlb })
        // log errors
        .catch(reason => { console.error(new Error(reason)); return null })
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} Execute: received gas price for param ${paramLogId} on chain ${chainId}`)
    // abort if we cannot get the gas price
    if (gasPrice === null) return
    // multiply gasPrice by 25%
    gasPrice = gasPrice * 125n / 100n

    // try to get nonce
    let nonce:bigint
    let i = 0
    while (true) {

        // get nonce
        const get = kv.get<bigint>
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Execute: attempt ${i} to get nonce for param ${paramLogId} on chain ${chainId}`)
        const maybeNonceGetRes = await kvRlb.regulate({ fn: get.bind(kv), args: [['NNCE', chainId]] as const })
            // log general error
            .catch(reason => { console.error(new Error(reason)); return null })
        // if general error, stop
        if (maybeNonceGetRes === null) return 

        // check nonce memory map
        // if it's confirmed on this machine that the nonce acquired from the above get
        // has already been successfully obtained and committed by the below set
        // by some process loop
        // then we should be able to skip the below set, cutting down on KV requests
        // and in general time spent here
        if ((maybeNonceGetRes.value ?? 0n) <= (nonces.get(chainId) ?? -1n)) continue

        // create an atomic function to verify nonce is the same and set it one higher
        const setAtom = kv.atomic()
        const setFn = setAtom
            .check(maybeNonceGetRes)
            .set(['NNCE', chainId], (maybeNonceGetRes.value ?? 0n) + 1n)
            .commit
        // try to commit this
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Execute: attempt ${i++} to commit next nonce ${((maybeNonceGetRes.value ?? 0n) + 1n)} for param ${paramLogId} on chain ${chainId}`)
        const maybeNonceSetRes = await kvRlb.regulate({ fn: setFn.bind(setAtom), args: [] as const })
            // log general errors
            .catch(reason => { console.error(new Error(reason)); return null })

        // if general error, stop
        if (maybeNonceSetRes === null) return

        // if commit failed, try again
        if (!maybeNonceSetRes.ok) continue

        // if commit succeeded, update the nonces memory map
        nonces.set(chainId, (maybeNonceGetRes.value ?? 0n))

        // set nonce equal to what we saw in the DB (and verified it is now that +1)
        nonce = maybeNonceGetRes.value ?? 0n

        // exit loop
        break

    }

    // create data
    const data = `0x40c10f19${
        recipient.padStart(64, '0')
        }${value.toString(16).padStart(64, '0')}`

    // hardcode to
    const to = '0x3419875B4D3Bca7F3FddA2dB7a476A79fD31B4fE'
    
    // create signedTx data
    const rawTxArray = [nonce, gasPrice, gasLimit, to, 0, data, chainId, 0, 0]
    const rawTxEncoding = encode(rawTxArray)
    const rawTxHash = keccak256(rawTxEncoding)
    const { r, s, recovery } = bridge.sign(rawTxHash)
    if (recovery === undefined) throw new Error('undefined recovery bit')
    const v = chainId * 2n + 35n + BigInt(recovery)
    const signedTxArray = [...rawTxArray.slice(0, 6), v, r, s]
    const signedTxBytes = encode(signedTxArray)
    const signedTx = `0x${bytesToHex(signedTxBytes)}`

    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Scan: sending mint transaction with nonce ${nonce} to chain ${chainId} for param ${paramLogId}`)

    // work backwards, fire and forget the mint transaction
    const signedTxHash = await m.sendRawTx({ data: signedTx, url, rlb: evmRlb })
        .catch(reason => console.error(new Error(reason)))
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} Scan: mint with nonce ${nonce} sent on chain ${chainId} for param ${paramLogId}`)
    if (!signedTxHash) return
    // // uncomment the following to see gasUsed per mint, probably a better way to go about this later
    // let receipt
    // while (!(receipt = await m.receipt({ hash: signedTxHash, url, rlb: evmRlb })));
    // console.log('gasUsed', receipt.gasUsed)

}