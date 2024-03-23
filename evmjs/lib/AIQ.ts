// Asynchronous Iterable Queue
// anything with a reference to it can push() items into the queue
// (probably only one thing should) read items from the queue like
// for await (const item of queue) { console.log(item) }
// queue reading runs until the AIQ's terminator symbol is pushed into the queue like
// see bottom for minimal usage example
export default class AIQ<T> implements AsyncIterator<T>{

    push!: (x: T|symbol) => void
    unshift!: (x: T|symbol) => void
    terminator: symbol
    #promise!: Promise<unknown>
    #queue: Array<T|symbol>
    limit?:number
    
    constructor(o?:{ limit?:number }) {
        this.#resetPromise()
        this.#queue = []
        if (o?.limit) this.limit = o.limit
        this.terminator = Symbol()
    }
    
    async next():Promise<IteratorResult<T>> {
        if (!this.#queue.length) await this.#promise
        this.#resetPromise()
        const value = this.#queue.shift() as T|symbol
        if (value === this.terminator) { return { done: true, value: null } }
        if (this.limit === 0) { return { done: true, value: null } }
        if (this.limit) { this.limit--; if (!this.limit) this.push(this.terminator) }
        return { value } as { value:T }
    }
    
    [Symbol.asyncIterator]() { return this }
    
    #resetPromise() {
        this.#promise = new Promise(r => {
            this.push = (x: T|symbol) => r(this.#queue.push(x))
            this.unshift = (x: T|symbol) => r(this.#queue.unshift(x))
        })
    }
    
}

// import AIQ from './lib/AIQ.ts'
// const aiq:AIQ<number> = new AIQ()
// ;(async () => { for await (const item of aiq) console.log(item) })()
// for (let i = 0; i < 10; i++) {
//     await new Promise(r => setTimeout(r, Math.random() * 2500))
//     if (i == 7) aiq.push(aiq.terminator)
//     aiq.push(Math.random())
// }