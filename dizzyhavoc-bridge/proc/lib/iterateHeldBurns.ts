import {
    Logger, LogLevel, Burn,
    kv, kvRlb as rlb
} from '../../internal.ts'

/**
 * Return an asyncIterator that iterates through held burns 
 */
export function iterateHeldBurns() {

    const asyncIterator = {
        i: 0,
        list: kv.list<Burn>({ prefix: ['hold'] }),
        async next():Promise<IteratorResult<Burn>> {
            Logger.debug(`iterateHeldBurns: pulling burn from hold, iteration ${this.i}`)
            const result = await Logger.wrap(
                rlb.regulate({ fn: this.list.next.bind(this.list), args: [] }),
                `pullHeldBurns: failed to send next burn request, iteration ${this.i}`,
                LogLevel.DEBUG, `pullHeldBurns: pull request for burn successful, iteration ${this.i}`)
            if (!result || result.done) return { done: true, value: null }
            const kvEntry = result.value
            const burn = new Burn(kvEntry.value)
            return { value: burn }
        },
        [Symbol.asyncIterator]() { return asyncIterator }
    }

   return asyncIterator

}