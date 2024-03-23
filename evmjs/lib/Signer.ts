import { getPublicKey, signAsync } from 'npm:@noble/secp256k1@2.0.0'
import jsSha3 from 'npm:js-sha3@0.9.2'
const { keccak256 } = jsSha3

type SignerOpts = { secret:string }
// deno-lint-ignore no-empty-interface
interface Signer extends SignerOpts {}
class Signer {
    constructor(opts:SignerOpts) {
        Object.assign(this, opts)
    }
    get address():string { return `0x${keccak256(getPublicKey(this.secret, false).slice(1)).slice(-40)}` }
    sign(unsignedTxHash:string) { return signAsync(unsignedTxHash, this.secret) }
}

export default Signer