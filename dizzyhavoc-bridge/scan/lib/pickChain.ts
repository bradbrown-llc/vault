import {
    Logger, Chain,
    updateChain, getAllChains
} from '../../internal.ts'

/**
 * Picks, updates, and returns the least recently updated chain
 */
export async function pickChain():Promise<Chain|null> {

    const chains = await getAllChains()

    const chain = chains.sort((a, b) => a.lastUpdated - b.lastUpdated)[0] as Chain|undefined

    if (!chain) {
        Logger.debug('pickChain: no chains available')
        return null
    }
    
    await updateChain({ chain })

    return chain

}