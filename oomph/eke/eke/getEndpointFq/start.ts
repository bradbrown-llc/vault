import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { AIQ } from '../../../../aiq/mod.ts'
import { UERR } from '../../.d.ts'
import { schemas } from '../../../ejra/mod.ts'
 
export async function start(queue:AIQ<UERR>) {
    for await (const { ejrcs, url, resolve, reject } of queue) {
        const map = new Map<number,z.ZodTypeAny>()
        const replacer = (_:string, v:unknown) => typeof v == 'bigint' ? ''+v : v
        const body = JSON.stringify(ejrcs.map((ejrc, id) => { map.set(id, schemas[ejrc.method]); return { jsonrpc: '2.0', ...ejrc, id } }), replacer)
        const headers = { 'Content-Type': 'application/json' }
        const init = { body, headers, method: 'POST' }
        fetch(url, init)
            .then(fetchResponseToJson)
            .then(jsonToJraResponses)
            .then(checkJraErrors)
            .then(tryParseResults)
            .then(checkParses)
            .catch(reject)
    }
}