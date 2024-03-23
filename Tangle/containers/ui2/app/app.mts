import express from 'express'
import { Wallet } from 'ethers6'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { JsonRpcProvider, Contract } from 'ethers6'
import chains from '@json/chains.json'
import tnglJson from '@json/tngl.json'
//@ts-ignore
import { handler } from './build/handler.js'

process.env.GOOGLE_APPLICATION_CREDENTIALS = './bradbrownllc-tngl-6f28aeff09d5.json'

let client = new SecretManagerServiceClient()
let name = 'projects/bradbrownllc-tngl/secrets/testnet-faucet-private-key/versions/4'
let { payload } = (await client.accessSecretVersion({ name }))[0]
let key = payload.data.toString()

let { address, abi } = tnglJson


let app = express()
let port = process.env.PORT || 80
app.set('trust proxy', true);
app.get('/_ah/*', async (_req, res) => res.status(404).end())
app.get('*', async (req, res, next) => {
    if (req.header('X-Forwarded-Proto') == 'http')
        res.redirect(301, `https://${req.headers.host}${req.path}`)
    next()
})
app.get('/faucet', async (req, res) => {
    let { chain } = req.query
    let sender = req.query.address
    let rpcUrl = chains[`${chain}`].rpcUrls[0]
    let provider = new JsonRpcProvider(rpcUrl)
    let wallet = new Wallet(key, provider)
    let Tangle = new Contract(address, abi, wallet)
    let status = 200
    let result = await Tangle.transfer(sender, 10000000000n)
        .catch((reason: any) => {
            status = 500
            return reason
        })
    res.status(status).end(JSON.stringify(result))
})
app.use(handler)
app.listen(port)