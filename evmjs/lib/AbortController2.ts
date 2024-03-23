export default class AbortController2 extends AbortController {
    timeout:number
    constructor(o?:{ timeout?:number }) { super(); this.timeout = o?.timeout ?? 5000 }
    get signal2() { return AbortSignal.any([AbortSignal.timeout(this.timeout), this.signal]) }
}