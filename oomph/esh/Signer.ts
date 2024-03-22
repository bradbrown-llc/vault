import { hmac } from 'npm:@noble/hashes@1.3.3/hmac'
import { sha256 } from 'npm:@noble/hashes@1.3.3/sha256'
import { getPublicKey, etc } from 'npm:@noble/secp256k1@2.0.0'
import jsSha3 from 'npm:js-sha3@0.9.2'
etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, etc.concatBytes(...m))
const { keccak256 } = jsSha3

/**
 * A Signer class to sign with, given a secret.
 */
export class Signer {

    secret:string
    
    constructor({ secret }:{ secret:string }) {
        this.secret = secret
    }
    
    /**
    * Get the address of the Signer.
    */
    get address() {
        if (!this.secret) throw new Error('missing secret')
        const pub = getPublicKey(this.secret, false).slice(1)
        const rawAddress = keccak256(pub).slice(-40)
        const hash = keccak256(rawAddress)
        let address = '0x'
        // checksum
        for (let i = 0; i < 40; i++)
            address += rawAddress[i]
                [parseInt(hash[i], 16) >= 8 ? 'toUpperCase' : 'toLowerCase']()
        return address
    }
    
}