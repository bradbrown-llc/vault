// import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
// import { schemas } from '../ejra/schemas/mod.ts'
// import { AIQ } from '../../aiq/mod.ts'

// const customErrorMap:z.ZodErrorMap = (issue, ctx) => {
//     if (issue.code == z.ZodIssueCode.invalid_type) {
//         if (issue.expected == 'array') {
//             return { message: `Expected array, received object: ${JSON.stringify(ctx.data)}` }
//         }
//     }
//     return { message: ctx.defaultError }
// }
// z.setErrorMap(customErrorMap)

// type EJRC = { method:keyof typeof schemas, params:unknown[] }
// type ToResults<E extends [EJRC, ...EJRC[]]> = {
//         [P in keyof E]:
//             E[P]['method'] extends keyof typeof schemas
//                 ? z.infer<typeof schemas[E[P]['method']]>
//                 : never }
// type UERR = { url:string, ejrcs:[EJRC, ...EJRC[]], resolve:(x:unknown)=>void, reject:(x:unknown)=>void }
                
// let fetched = { mc: 0, ep: new Map<string,number>() }
// const tpms = { mc: 1000, ep: new Map<string,number>() }
// const aiqs = { mc: new AIQ<EJRARQ>(), ep: new Map<string,AIQ<EJRARQ>>() }

// function fetchfn({ url, ejrcs, resolve, reject }:Required<EJRARQ>) {
//     // console.log(`sending out fetch at ${Date.now()}`)
//     const map = new Map<number,z.ZodTypeAny>()
//     // console.log(`foo`)
//     const replacer = (_:string, v:unknown) => typeof v == 'bigint' ? ''+v : v
//     const body = JSON.stringify(ejrcs.map((ejrc, id) => { map.set(id, schemas[ejrc.method]); return { jsonrpc: '2.0', ...ejrc, id } }), replacer)
//     // console.log(`bar`)
//     const headers = { 'Content-Type': 'application/json' }
//     // console.log(`baz`)
//     const init = { body, headers, method: 'POST' }
//     // console.log(`boo`)
//     fetch(url, init)
//         // coerce response to json
//         .then(response => { /*console.log('0');*/ return response.json() })
//         // coerce response to array of json rpc api response objects
//         .then(json => { /*console.log('1');*/ return z.object({ result: z.unknown(), error: z.unknown(), id: z.number() }).array().parseAsync(json) }) 
//         // transform into an object with the errors and results as arrays
//         .then(responses => { /*console.log('2');*/ return ({ errors: responses.map(({ error }) => error).filter(x=>x), responses }) })
//         // if there are any errors, reject with the errors, otherwise, transform into just the responses
//         .then(({ errors, responses }) => { /*console.log('3');*/ if (errors.length) { reject(errors); throw new Error(JSON.stringify(errors)) }; return responses })
//         // map responses to schema async parsed, return as Promise.allSettled
//         .then(responses => { /*console.log('4');*/ return Promise.allSettled(responses.map(({ id, result }) => map.get(id)?.parseAsync(result) )) })
//         // transform into an object with the reason failures and results as arrays
//         .then(results => { /*console.log('5');*/ return ({ errors: (results as { reason:Error }[]).map(({ reason }) => reason).filter(x=>x), results }) })
//         // if there are any errors, reject with the errors, otherwise, transform settledResults into values and resolve
//         .then(({ errors, results }) => { /*console.log('6');*/ if (errors.length) { reject(errors); throw new AggregateError(errors) }; resolve((results as { value:unknown }[]).map(({ value }) => value)) })
//         // catch whatever fell through here and reject it
//         .catch(reject)
// }

// async function start(aiq:AIQ<EJRARQ>, fn:(...params:unknown[])=>Promise<void>) {
//     for await (const params of aiq) await fn(params)
// }

// ;(async () => { for await (const { url, ejrcs, resolve, reject, delay } of aiqs.mc) {
//     if (delay) {
//         0
//     } else if (url && ejrcs && resolve && reject) {
//         const t = tpms.ep.get(url) ?? 1000
//         const f = fetched.ep.get(url) ?? 0
//         if (!aiqs.ep.get(url)) { aiqs.ep.set(url, new AIQ<EJRARQ>); start(aiqs.ep.get(url))
//         const aiq = aiqs.ep.get(url) as AIQ<EJRARQ>
//         const delay = Math.max(0, t + f - Date.now())
//         aiq.push({ delay })
//         fetched.ep.set(url, Date.now() + delay)
//     }
// } })()

// export function eke<E extends [EJRC, ...EJRC[]]>({ url, ejrcs }:{ url:string, ejrcs:E }) {
//     const { promise, resolve, reject } = Promise.withResolvers<ToResults<E>>() as { promise:Promise<ToResults<E>>, resolve:(x:unknown)=>void, reject:(x:unknown)=>void }
//     const delay = Math.max(0, tpms.mc + fetched.mc - Date.now())
//     aiqs.mc.push({ delay })
//     fetched.mc = Date.now() + delay
//     aiqs.mc.push({ url, ejrcs, resolve, reject })
//     return promise
// }

import { machineQueue } from './mod.ts'
import { EJRCs, UE, SchemaReturn, GetMethods, GetReturns } from '../.d.ts'

function promiseWithResolvers<T extends U,U>() {
    return Promise.withResolvers() as {
        promise:Promise<T>,
        resolve:(value: U | PromiseLike<U>)=>void,
        reject:(reason:Error)=>void
    }
}

let fetched = 0

export function eke<E extends EJRCs>(ue:UE<E>) {
    // const { promise, ...uerr } = Object.assign({ ...ue }, Promise.withResolvers<GetReturns<GetMethods<E>>>())
    const { promise, ...uerr } = Object.assign({ ...ue }, promiseWithResolvers<GetReturns<GetMethods<E>>, SchemaReturn[]>())
    const delay = Math.max(0, 1000 + fetched - Date.now())
    new Promise(r => setTimeout(r, delay)).then(() => machineQueue.push(uerr))
    fetched = Date.now() + delay
    return promise
}