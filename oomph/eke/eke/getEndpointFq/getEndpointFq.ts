import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { schemas } from '../../ejra/mod.ts'
import { AIQ } from '../../../aiq/mod.ts'
import { UERR } from '../.d.ts'

const map = new Map<string,{ fetched:number, queue:AIQ<UERR> }>()

async function start(queue:AIQ<UERR>) {
    for await (const { ejrcs, url, resolve, reject } of queue) {
        const map = new Map<number,z.ZodTypeAny>()
        const replacer = (_:string, v:unknown) => typeof v == 'bigint' ? ''+v : v
        const body = JSON.stringify(ejrcs.map((ejrc, id) => { map.set(id, schemas[ejrc.method]); return { jsonrpc: '2.0', ...ejrc, id } }), replacer)
        const headers = { 'Content-Type': 'application/json' }
        const init = { body, headers, method: 'POST' }
        // fetch(url, init)
        //     // coerce response to json
        //     .then(response => { /*console.log('0');*/ return response.json() as Promise<unknown> })
        //     // coerce response to array of json rpc api response objects
        //     .then(json => { /*console.log('1');*/ return z.object({ result: z.unknown(), error: z.object({ message: z.string() }), id: z.number() }).array().parseAsync(json) }) 
        //     // transform into an object with the errors and results as arrays
        //     .then(responses => { /*console.log('2');*/ return ({ errors: responses.map(({ error }) => error).filter(x=>x), responses }) })
        //     // if there are any errors, reject with the errors, otherwise, transform into just the responses
        //     .then(({ errors, responses }) => { /*console.log('3');*/ if (errors.length) { reject(new AggregateError(errors.map(({ message }) => new Error(message)))); throw new Error(JSON.stringify(errors)) }; return responses })
        //     // map responses to schema async parsed, return as Promise.allSettled
        //     .then(responses => { /*console.log('4');*/ return Promise.allSettled(responses.map(({ id, result }) => map.get(id)?.parseAsync(result) )) })
        //     // transform into an object with the reason failures and results as arrays
        //     .then(results => { /*console.log('5');*/ return ({ errors: (results as { reason:Error }[]).map(({ reason }) => reason).filter(x=>x), results }) })
        //     // if there are any errors, reject with the errors, otherwise, transform settledResults into values and resolve
        //     .then(({ errors, results }) => { /*console.log('6');*/ if (errors.length) { reject(errors); throw new AggregateError(errors) }; resolve((results as { value:unknown }[]).map(({ value }) => value)) })
        //     // catch whatever fell through here and reject it
        //     .catch(reject)
    }
}

export function getEndpointFq(url:string) {
    let fq = map.get(url)
    if (!fq) map.set(url, fq = { fetched: 0, queue: new AIQ<UERR>() })
    return fq
}