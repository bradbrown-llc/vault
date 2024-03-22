import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
import * as m from 'https://deno.land/x/ejra@0.2.2/methods/mod.ts'
import { pickBridgeable, vouchFilter, updateBridgeable, process, loglev, logstamp } from './lib/mod.ts'
import { Bridgeable, ProcParam } from './types/mod.ts'

// verify bridge secret env var exists
const DZHV_BRIDGE_LOG_LEVEL = Number(Deno.env.get('DZHV_BRIDGE_LOG_LEVEL'))
if (!DZHV_BRIDGE_LOG_LEVEL) throw new Error("missing env var 'DZHV_BRIDGE_LOG_LEVEL'")

// verify bridge secret env var exists
const DZHV_BRIDGE_SECRET = Deno.env.get('DZHV_BRIDGE_SECRET')
if (!DZHV_BRIDGE_SECRET) throw new Error("missing env var 'DZHV_BRIDGE_SECRET'")

// verify DZHV_MACHINE_ID env var exists
const DZHV_MACHINE_ID = Deno.env.get('DZHV_MACHINE_ID')
if (!DZHV_MACHINE_ID) throw new Error("missing env var 'DZHV_MACHINE_ID'")

// get maxProc
const DZHV_MAXPROC = Number(Deno.env.get('DZHV_MAXPROC'))
if (!DZHV_MAXPROC) throw new Error("missing env var 'DZHV_MAXPROC'")

// open kv
const DZHV_SCANNER_KV_PATH = Deno.env.get('DZHV_SCANNER_KV_PATH')
if (!DZHV_SCANNER_KV_PATH) throw new Error("missing env var 'DZHV_SCANNER_KV_PATH'")
const kv = await Deno.openKv(DZHV_SCANNER_KV_PATH)

// create RLBs
const kvRlb = new RLB()
kvRlb.lim = 3
kvRlb.delay = 50
const evmRlb = new RLB()
evmRlb.lim = 3
evmRlb.delay = 75

// create memory processing set
const proc = new Set<string>

// height cache
const heights:Map<bigint,bigint> = new Map()

// nonces cache
const nonces:Map<bigint,bigint> = new Map()

// # check KV PROC, process logs in there up to DZHV_MAXPROC
// get an iterator that will let us iterate through this machine's PROCs on KV
const procIter = kv.list<ProcParam|undefined>({ prefix: ['MCHN', DZHV_MACHINE_ID] })
// loop through all of this machine's ProcParams
for (let i = 0; i < DZHV_MAXPROC; i++) {
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Getting next param ${i} in KV PROC&MCHN(this)`)
    const result = await kvRlb.regulate({ fn: procIter.next.bind(procIter), args: [] })
        .catch(reason => console.error(new Error(reason)))
    // if iter is done or we get an error, break the loop
    if (!result || result.done) break
    // otherwise, if the iter result contains a param, process it
    if (result.value.value) { const { log, chain } = result.value.value; process({ log, chain, evmRlb, kv, kvRlb, proc, heights, sunPass: true, nonces }) }
}

// # check KV PROC, process logs in there up to DZHV_MAXPROC
// get an iterator that will let us iterate through this machine's PROCs on KV
const sentIter = kv.list<ProcParam|undefined>({ prefix: ['SENT'] })
// loop through all of this machine's ProcParams
for (let i = 0; i < DZHV_MAXPROC; i++) {
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Getting next param ${i} in KV SENT`)
    const result = await kvRlb.regulate({ fn: sentIter.next.bind(sentIter), args: [] })
        .catch(reason => console.error(new Error(reason)))
    // if iter is done or we get an error, break the loop
    if (!result || result.done) break
    // if iter result isn't a Foo, whhich shouldn't happen, move on
    if (!result.value.value) continue
    // otherwise, if the iter result contains a param, process it
    if (result.value.value) { const { log, chain } = result.value.value; process({ log, chain, evmRlb, kv, kvRlb, proc, heights, sunPass: true, nonces }) }
}

while (true) {
    
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} scan: loop start`)

    if (proc.size >= DZHV_MAXPROC) { await new Promise(r => setTimeout(r, kvRlb.delay)); continue }

    // # check KV HOLD, process logs in there up to DZHV_MAXPROC
    // get an iterator that will let us iterate through KV HOLD params
    const iter = kv.list<ProcParam|undefined>({ prefix: ['HOLD'] })
    // start iteratin' through the HOLDs if proc is at half capacity
    if (proc.size < DZHV_MAXPROC * 0.50) {
        for (let i = 0; i < DZHV_MAXPROC - proc.size; i++) {
            if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Getting next param ${i} in KV HOLD`)
            const iterResult = await kvRlb.regulate({ fn: iter.next.bind(iter), args: [] })
                .catch(reason => console.error(new Error(reason)))
            // if iter is done or we get an error, break the loop
            if (!iterResult || iterResult.done) break
            // otherwise, if the iter contains a param, change it to PROC & MCHN, then process it with sunpass 
            if (iterResult.value.value) {
                // extract values
                const kvEntry = iterResult.value as Deno.KvEntry<ProcParam>
                const param = kvEntry.value
                const { log, chain } = param
                const { transactionHash:hash } = log
                const { chainId } = chain
                const paramLogId = `${hash.slice(-4)}:${chainId}`
                // keys
                const arcvKey:Deno.KvKey = ['ARCV', hash] // <ProcParam> proc param
                const doneKey:Deno.KvKey = ['DONE', hash] // <string> tx hash
                const holdKey:Deno.KvKey = ['HOLD', hash] // <ProcParam> proc param
                const procKey:Deno.KvKey = ['PROC', hash] // <ProcParam> proc param
                const mchnKey:Deno.KvKey = ['MCHN', DZHV_MACHINE_ID, hash] // <ProcParam> proc param
                // change from HOLD to PROC&MCHN
                const procAtom = kv.atomic()
                const procSet = procAtom
                    .check(kvEntry) // check that the param is still in HOLD
                    .check(
                        { key: arcvKey, versionstamp: null }, // and not in ARCV
                        { key: procKey, versionstamp: null }, // and not in PROC
                        { key: mchnKey, versionstamp: null }, // and not in MCHN
                        { key: doneKey, versionstamp: null }, // and not in DONE 
                    )
                    .delete(holdKey) // delete param from HOLD
                    .set(procKey, param) // set param in KV PROC
                    .set(mchnKey, param) // set param in KV MCHN
                    .commit
                if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Moving param ${paramLogId} from KV HOLD to PROC&MCHN(this)`)
                const result = await kvRlb.regulate({ fn: procSet.bind(procAtom), args: [] as const })
                    // log general errors
                    .catch(reason => { console.error(new Error(reason)); return null })
                // if we got an access or commit failure, don't process this
                if (!result?.ok) continue
                // otherwise, process with sunPass true
                process({ log, chain, evmRlb, kv, kvRlb, proc, heights, sunPass: true, nonces })
            }
        }
    }

    // pick a chain
    // consequence of failure: none (state-wise, in practicality the bridge will do nothing as long as this fails)
    const chain = await pickBridgeable({ kv, rlb: kvRlb })
    // if this fails, go next
    if (!chain) continue

    // extract vars
    const { filter, chainId } = chain

    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Picked chain ${chainId}`)

    // update chain so we don't pick the same one over and over if the next step fails due to some EVM rpc failure
    // consequence of failure: none (state-wise, in practicality the bridge will do nothing as long as this fails)
    await updateBridgeable({ chain, kv, rlb: kvRlb })

    // true if there are blocks to be scanned, false if there aren't, null if we can't determine the answer
    // consequence of failure: chain is skipped this iter
    const vouch = await vouchFilter({ chain, rlb: evmRlb })
    // if there are no blocks to scan or this fails and go next
    if (!vouch) continue

    // update chain so that if the next step fails but the previous one didn't then we don't have to make another EVM call for an updated filter
    // consequence of failure: filter is not updated and events may be rescanned
    await updateBridgeable({ chain, kv, rlb: kvRlb })

    // get the logs for our filter
    // consequence of failure: filter shrinks down on error (to handle the different log-related limits each node may have)
    //      if a chain fails when the filter is one block wide, that chain will be stuck for as long as there is a failure. no issues state-wise,
    if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`INFO ${logstamp()} Scan: getting logs on chain ${chainId}`)
    const logs = await m.logs({
        filter: chain.filter, 
        url: chain.rpcs[0],
        rlb: evmRlb
    })
    .then(logs => {
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} Scan: received logs on chain ${chainId}`)
        return logs
    }).catch(async reason => {
        if (DZHV_BRIDGE_LOG_LEVEL >= loglev.INFO) console.log(`DBUG ${logstamp()} Scan: received logs on chain ${chainId}`)
        // log error
        console.error(new Error(reason))
        // halve filter size
        const { fromBlock, toBlock } = filter
        filter.toBlock = fromBlock + (toBlock - fromBlock) / 2n
        //, update bridgeable
        await updateBridgeable({ chain, kv, rlb: kvRlb }).catch(reason => console.error(new Error(reason)))
        //  return null
        return null
    })
    // if there was an error getting logs, go next
    if (!logs) continue

    // start processing each log 
    logs.forEach(log => process({ log, chain, evmRlb, kv, kvRlb, proc, heights, nonces }))

    // update filter
    // consequence of failure: events may be scanned again since filter did not update. this will be handled in process()
    filter.fromBlock = filter.toBlock + 1n
    await updateBridgeable({ chain, kv, rlb: kvRlb })
    
}