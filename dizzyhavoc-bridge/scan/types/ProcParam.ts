import { Log } from 'https://deno.land/x/ejra@0.2.2/types/mod.ts'
import { Bridgeable } from './mod.ts'

export type ProcParam = {
    chain:Bridgeable
    log:Log
}