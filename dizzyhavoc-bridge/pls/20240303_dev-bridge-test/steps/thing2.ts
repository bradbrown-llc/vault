import { Signer, mkn0 } from '../../../lib/mod.ts'

// signer set up
const deployer = new Signer({ secret: Deno.env.get('DZHV_DEPLOYER_SECRET') as string })
const implementer = new Signer({ secret: Deno.env.get('DZHV_IMPLEMENTER_SECRET') as string })
const destroyer = new Signer({ secret: Deno.env.get('DZHV_DESTROYER_SECRET') as string })
const wallet = new Signer({ secret: Deno.env.get('DZHV_WALLET_SECRET') as string })
const bridge = new Signer({ secret: Deno.env.get('DZHV_BRIDGE_SECRET') as string })
const burner = new Signer({ secret: ''.padStart(64, 'A') })

// acquire node urls
const signer = new Signer({ secret: Deno.env.get('TEST_SIGNER') as string })
const signers = [signer, deployer, implementer, destroyer, wallet, burner, bridge]
await mkn0({ signers, httpPort: 8546, chainId: 8546, log: true })