import z from 'https://deno.land/x/zod@v3.22.4/index.ts';
import { overrides } from './overrides.ts'

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

// query overrides and then ethereum-lists/chains for chain info
export async function query({ id }:{ id:bigint }) {

    // search overrides for chain
    const override = overrides.find(({ chainId }) => BigInt(chainId) == id)
    // otherwise attempt to pull and parse chain from lib/chains/ 
    const chain = override
        ? null
        : await import(`./chains/_data/chains/eip155-${id}.json`, { with: { type: 'json' } })
            .then(schemas.chain.parseAsync)
            .catch(() => null)

    return override ?? chain 

}