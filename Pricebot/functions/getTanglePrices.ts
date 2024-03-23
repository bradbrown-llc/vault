import superagent from 'superagent'
import { ankr_getTokenPrice, params } from '../vars/index.js'
import { handleCatch, translate } from './index.js'

export async function getTanglePrices() {
    let reqs = params.map((params, id) => { return { id, ...ankr_getTokenPrice, params } })
    let res = await superagent.post('https://rpc.ankr.com/multichain').send(reqs).catch(handleCatch)
    return res['body'].map(
        (res: { result: { blockchain: string; usdPrice: string } }) => 
            `${translate(res.result.blockchain)}\t$${res.result.usdPrice.substring(0, 11)}`)
    .join('\n')
    .replace(/\./g, '\\.')
}