import { Signer, signRawTx } from '../../../lib/mod.ts'
import { methods as m, batched as b, lib as l } from 'https://deno.land/x/ejra@0.2.2/mod.ts'
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'

export async function erc20_link({
    session,
    resolver, erc20, nonce,
    execute, traceTx, traceCall,
    rlb
}:{
    session:{ implementer:Signer, url:string, gasPrice:bigint, chainId:bigint },
    resolver:{ address:string }, erc20: { address:string }, nonce:bigint
    execute?:boolean, traceTx?:boolean, traceCall?:boolean,
    rlb:RLB
}) {
    const { implementer, url, chainId } = session
    const data = `0x3608adf5${ // selector
        '0000000000000000000000000000000000000000000000000000000000000020' // offset of dies
        }${'0000000000000000000000000000000000000000000000000000000000000001' // length of dies
        }${'0000000000000000000000000000000000000000000000000000000000000020' // offset of selectors of first die
        }${'000000000000000000000000?C??????????????????????????????????????' // erc20 address
        }${'0000000000000000000000000000000000000000000000000000000000000040' // ofset of selector data begin of first die
        }${'000000000000000000000000000000000000000000000000000000000000000b' // length of selectors of first die
        }${'00000000000000000000000000000000000000000000000000000000dd62ed3e' // allowance
        }${'00000000000000000000000000000000000000000000000000000000095ea7b3' // approve
        }${'0000000000000000000000000000000000000000000000000000000070a08231' // balanceOf
        }${'000000000000000000000000000000000000000000000000000000009eea5f66' // burn
        }${'00000000000000000000000000000000000000000000000000000000313ce567' // decimals
        }${'000000000000000000000000000000000000000000000000000000007e0b4201' // multimint
        }${'0000000000000000000000000000000000000000000000000000000040c10f19' // singlemint
        }${'0000000000000000000000000000000000000000000000000000000006fdde03' // name
        }${'0000000000000000000000000000000000000000000000000000000095d89b41' // symbol
        }${'0000000000000000000000000000000000000000000000000000000018160ddd' // totalSupply
        }${'00000000000000000000000000000000000000000000000000000000a9059cbb' // transfer
        }${'0000000000000000000000000000000000000000000000000000000023b872dd'}` // transferFrom
        .replace(/\?C\?+/g, erc20.address.slice(2))
    const call = { input: data, from: implementer.address, to: resolver.address }
    const gasLimit = await m.estimateGas({ tx: call, url, rlb }) * 200n / 100n
    const tx = { signer: implementer, gasLimit, data, ...call, ...session, nonce }
    const { signedTx, hash } = signRawTx(tx)
    console.log(`linking erc20 on chainId ${chainId}`)
    const erc20_link = { hash, ...b.sendRawTx({ data: signedTx }) }
    if (execute) {
        l.call({ url, request: erc20_link })
        while (true) {
            const receipt = await m.receipt({ hash, url, rlb })
            if (receipt && receipt.status == '0x0') throw new Error('failed')
            if (receipt) break
        }
    }
    // if (traceTx) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceTx({ ...erc20_link }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    // if (traceCall) {
    //     const temp = Deno.makeTempFileSync()
    //     Deno.writeTextFileSync(temp, JSON.stringify(await e.traceCall({ tx }).call(url), undefined, 4))
    //     console.log(temp)
    // }
    return erc20_link
}