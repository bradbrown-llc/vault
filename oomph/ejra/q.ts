import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
/**
 * A Zod schema to take a string and transform it into a bigint.
 * ('q' as in QUANTITY as used at
 * https://ethereum.org/en/developers/docs/apis/json-rpc#quantities-encoding)
 */
export const q = z.string().transform(BigInt)