import { query } from './query.ts'
import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
const schemas = {
    chain: z.object({
        name: z.string(),
        chain: z.string(),
        rpc: z.string().array().transform(urls => {
            return urls.filter(url =>
                !url.match(/wss|API_KEY/i)
                && !url.match(/mycryptoapi.com/)
            )
        }), // don't support wss or nodes requiring an API key (yet)
        nativeCurrency: z.object({
            name: z.string(),
            symbol: z.string(),
            decimals: z.number()
        }),
        chainId: z.number(),
        explorers: z.object({
            name: z.string(),
            url: z.string(),
            standard: z.string()
        }).array(),
        shortName: z.string()
    })
}

// active chain IDs
const ids = [
    1n,     // ethereum,
    56n,    // binance smart chain
    8453n,  // base
    42161n, // arbitrum
    43114n, // avalanche,
    8546n,  // local testnet 8546
]

// an array of bridgeable chains constructed from the above list of chain IDs
export const bridgeable = await Promise.all(ids.map(id => query({ id }))) as z.infer<typeof schemas.chain>[]