import EventEmitter from 'eventemitter3'
import * as data from './data'

export default new class extends EventEmitter {

    constructor() {
        super()
        this.chains = {}
    }

    watch(args) {
        console.log('watch')
        let { chains } = this
        let { app, chainId } = args
        if (!chains[chainId]) {
            let apps = [], data = {}, id = chainId, nonce = 0n
            chains[chainId] = { apps, data, id, nonce }
        }
        let chain = chains[chainId]
        let { apps } = chain
        if (apps.indexOf(app) == -1) {
            apps.push(app)
            let trip = 'newWatch'
            let data = { trip, chain }
            this.trip(data)
        }
        console.log(this.chains)
    }

    unwatch(args) {
        console.log('unwatch')
        let { chains } = this
        let { app, chainId } = args
        let chain = chains[chainId]
        let { apps } = chain
        apps.splice(apps.indexOf(app), 1)
        if (apps.length == 0) {
            let { poll } = chain
            if (poll) clearInterval(poll)
            delete chains[chainId]
        }
        console.log(this.chains)
    }

    async trip(args) {
        let { trip, chain, block } = args
        console.log('trip', trip)
        let { nonce } = chain
        let tmp = {}
        let patients = Object.keys(data).map(key => data[key])
            .filter(patient => patient.trips.includes(trip))
            .filter(patient => patient.apps
                .map(app => chain.apps.includes(app))
                .includes(true))
        let nonpatients = Object.keys(data)
            .filter(id =>
                !patients.map(patient => patient.id).includes(id))
        console.log('patients', patients)
        console.log('nonpatients', nonpatients)
        nonpatients.forEach(key => tmp[key] = chain.data[key])
        let thunk = await this.evaluate(tmp, patients, chain)
        while (typeof thunk == 'function')
            thunk = await thunk(tmp, patients, chain)
        if (trip == 'block' && chain.nonce != nonce) return
        if (block !== undefined) tmp.block = block
        chain.data = tmp
        console.log(chain)
    }

    async evaluate(tmp, patients, chain) {
        console.log('evaluate')
        for (let patient of patients) {
            console.log('patient', patient)
            console.log('tmp', tmp)
            let { fn, id } = patient
            let needs = patient.needs.map(need => tmp[need])
            if (needs.includes(null)) {
                console.log('null need')
                tmp[id] = null
            }
            else if (needs.includes(undefined)) {
                console.log('undefined need')
                continue
            }
            else {
                console.log('executing fn')
                tmp[id] = await fn.bind({ chain, medium: this })()
            }
            patients.splice(patients.indexOf(patient), 1)
        }
        console.log(tmp)
        if (patients.length > 0)
            return () => this.evaluate(tmp, patients, chain)
    }

}