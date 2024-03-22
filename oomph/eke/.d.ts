import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { schemas } from '../ejra/mod.ts'

type EJRC = { method:SchemaKey, params:unknown[] }
type EJRCs = [EJRC, ...EJRC[]]
type SchemaMap = typeof schemas
type SchemaKey = keyof SchemaMap
type SchemaInferMap = { [P in SchemaKey]: z.infer<SchemaMap[P]> }
type SchemaReturn = SchemaInferMap[keyof SchemaMap]
type GetMethods<E extends EJRCs> = { [P in keyof E]: E[P]['method'] }
type GetReturns<M extends SchemaKey[]> = { [P in keyof M]: SchemaInferMap[M[P]] }
type UE<E extends EJRCs> = { url:string, ejrcs:E }
type UERR = {
    url:string
    ejrcs:EJRCs
    resolve:(value:SchemaReturn[]|PromiseLike<SchemaReturn[]>)=>void
    reject:(reason:Error)=>void
}