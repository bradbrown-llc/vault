import gtmn from '@/data/gtmn.js'
import { JsonRpcProvider } from 'ethers'

export default {
    id: 'provider',
    trips: ['newWatch'],
    apps: ['stake', 'mine'],
    needs: [],
    fn: function() {
        let { chain, medium } = this
        let { id, poll } = chain
        let provider = new JsonRpcProvider(gtmn[id].rpc)
        if (poll) clearInterval(poll)
        chain.poll = setInterval(async () => {
            let block = await provider.getBlockNumber()
                .catch(() => {})
            console.log('poll', block, chain.data.block)
            if (block === undefined) return
            if (block > chain.data.block
            || chain.data.block === undefined)
                medium.trip({ trip: 'block', chain, block })
        }, 5000);
        return provider
    }
}