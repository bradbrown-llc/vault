import {
    Chain, Logger, LogLevel,
    ejra, kv, kvRlb as rlb, machineId,
    parseBurnData
} from '../internal.ts'

type BurnState = 'archive'|'hold'|'processing'

/**
 * Burn class. Has utilities and functions for working with burn events
 * in the context of the bridge
 */
export class Burn {

    hash:string
    height:bigint
    sourceChainId:bigint
    destinationChainId:bigint
    recipient:string
    value:bigint

    constructor({
        hash, height, sourceChainId, destinationChainId, recipient, value
    }:{
        hash:string
        height:bigint
        sourceChainId:bigint
        destinationChainId:bigint
        recipient:string
        value:bigint
    }) {
        this.hash = hash
        this.height = height
        this.sourceChainId = sourceChainId
        this.destinationChainId = destinationChainId
        this.recipient = recipient
        this.value = value
    }

    /**
     * Convert an object with a log and a chain into a Burn
     */
    static from({ log, chain }:{ log:ejra.types.Log, chain:Chain }) {
        const { transactionHash:hash, blockNumber:height } = log
        const { chainId:sourceChainId } = chain
        const { destinationChainId, recipient, value } = parseBurnData(log)
        return new Burn({ hash, height, sourceChainId, destinationChainId, recipient, value })
    }

    /**
     * Move this burn from one state to another
     */
    async moveState({
        from, to
    }:{
        from:BurnState|null
        to:BurnState|null
    }) {

        const { sourceChainId:chainId, hash } = this
        
        const keys = [
            ['archive', chainId, hash],
            ['hold', chainId, hash],
            ['processing', chainId, hash],
            ['machine', machineId, chainId, hash],
            ['sent', chainId, hash],
            ['done', chainId, hash]
        ] as const

        const notFromKeys = from === null ? keys : keys.filter(key => !key.includes(from))
        const fromKey = from === null ? null : keys.find(key => key.includes(from))
        const toKey = to === null ? null : keys.find(key => key.includes(to))

        const atom = kv.atomic()
            .check(...notFromKeys.map(key => ({ key, versionstamp: null })))
        if (fromKey) atom.delete(fromKey)
        if (fromKey?.[0] == 'processing') atom.delete(keys[3])
        if (toKey) atom.set(toKey, this)
        if (toKey?.[0] == 'processing') atom.set(keys[3], this)
        const commit = atom.commit
        const result = await Logger.wrap(
            rlb.regulate({ fn: commit.bind(atom), args: [] }),
            `Burn: burn ${this.hash.slice(-8)} state move from ${from} to ${to} failed`,
            LogLevel.DEBUG, `Burn: burn ${this.hash.slice(-8)} state moved from ${from} to ${to}`)

        // return whether or not the state transition succeeded
        return result?.ok ?? false

    }

    /**
     * Return an AsyncIterator for burns in the specified state
     */
    static iterate(state:BurnState) {

        const asyncIterator = {
            i: 0,
            list: kv.list<Burn>({ prefix: [state] }),
            async next():Promise<IteratorResult<Burn>> {
                Logger.debug(`Burn: pulling burn from ${state}, iteration ${this.i}`)
                const result = await Logger.wrap(
                    rlb.regulate({ fn: this.list.next.bind(this.list), args: [] }),
                    `Burn: burn state ${state} pull request failed, iteration ${this.i}`,
                    LogLevel.DEBUG, `Burn: burn state ${state} pull request successful, iteration ${this.i}`)
                if (!result || result.done) return { done: true, value: null }
                const kvEntry = result.value
                const burn = new Burn(kvEntry.value)
                return { value: burn }
            },
            [Symbol.asyncIterator]() { return asyncIterator }
        }

        return asyncIterator

    }

}