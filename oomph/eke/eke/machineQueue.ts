import { AIQ } from '../../../aiq/mod.ts'
import { UERR } from '../.d.ts'
import { getEndpointFq } from './getEndpointFq.ts'

const machineQueue = new AIQ<UERR>()

;(async () => {
    for await (const { url } of machineQueue) {
        const fq = getEndpointFq(url)
        const delay = Math.max(0, 1000 + fq.fetched - Date.now())
        new Promise(r => setTimeout(r, delay)).then(() => fq.queue.push(uerr))
        fq.fetched = Date.now() + delay
    }
})()

export { machineQueue }