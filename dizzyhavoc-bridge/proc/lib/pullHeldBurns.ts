import {
    Mint, Burn, Cache, processing, finalize, execute
} from '../../internal.ts'

/**
 * Pull burns in KV hold, moves them to processing if appropriate, then begins the finalization loop per burn 
 */
export async function pullHeldBurns() {

    for await (const burn of Burn.iterate('hold')) {

        if (processing.has(burn.hash)) continue

        if (processing.size >= await Cache.get('maxProcessing')) return

        const result = await burn.moveState({ from: 'hold', to: 'processing' })

        if (!result) continue

        if (processing.size >= await Cache.get('maxProcessing')) return

        if (processing.has(burn.hash)) continue

        processing.add(burn.hash)

        const finalized = await finalize(burn)

        if (!finalized) {
            await burn.moveState({ from: 'processing', to: finalized === false ? null : 'hold' })
            processing.delete(burn.hash)
            return
        }

        const mint = await Mint.from(burn)
        if (!mint) {
            if (mint === false) burn.moveState({ from: 'processing', to: 'archive' })
            else burn.moveState({ from: 'processing', to: 'hold' })
        }

        execute(mint)

    }
    
}