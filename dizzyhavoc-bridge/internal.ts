// re-export ejra
export * as ejra from 'https://deno.land/x/ejra@0.2.1/mod.ts'

import { machineId as _machineId } from './lib/machineId.ts'
export * from './lib/machineId.ts'

// export types and enums
export * from './types/CacheEntry.ts'
export * from './types/Chain.ts'
export * from './types/Filter.ts'
export * from './types/LogLevel.ts'

// export libraries 
    // general library
    export * from './lib/Burn.ts'
    export * from './lib/Mint.ts'
    export * from './lib/Logger.ts'
    export * from './lib/sleep.ts'
    import { Cache as _Cache } from './lib/Cache.ts'
    export * from './lib/Cache.ts'
    export * from './lib/kvGet.ts'
    // scanner library
    export * from './scan/lib/getAllChains.ts'
    export * from './scan/lib/getBurns.ts'
    export * from './scan/lib/pickChain.ts'
    export * from './scan/lib/updateChain.ts'
    export * from './scan/lib/vouchFilter.ts'
    export * from './scan/lib/parseBurnData.ts'
    // processor library
    export * from './proc/lib/iterateHeldBurns.ts'
    export * from './proc/lib/pullHeldBurns.ts'
    export * from './proc/lib/finalize.ts'
    export * from './proc/lib/execute.ts'



// export RLBs
import { RLB } from 'https://deno.land/x/rlb@0.0.9/RLB.ts'
export const evmRlb = new RLB()
export const kvRlb = new RLB()

// export kv
const kvPath = Deno.env.get('DZHV_KV_PATH')
export const kv = await Deno.openKv(kvPath)

// export processing
export const processing = new Set<string>()

// export heights
export const heights = new Map<bigint,bigint>()

// export bridge signer
import { Signer } from './lib/Signer.ts'
const secret = Deno.env.get('BRIDGE_SECRET') as string
if (!secret) throw new Error('internal: missing env var "BRIDGE_SECRET"')
export const bridge = new Signer({ secret })