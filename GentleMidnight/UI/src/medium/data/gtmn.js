import gtmn from '@/data/gtmn.js'
import { abi } from '@/data/abi/gtmn.js'
import { Contract } from 'ethers'

export default {
    id: 'gtmn',
    trips: ['newWatch'],
    apps: ['mine'],
    needs: ['provider'],
    fn: function() {
        let { chain, medium } = this
        let { id, poll, data } = chain
        let { addr } = gtmn[id]
        let { provider } = data
        return new Contract(addr, abi, provider)
    }
}