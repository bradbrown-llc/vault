import {
    machineId,
    CacheEntry,
    Logger, LogLevel,
    kv, kvRlb as rlb
} from '../internal.ts'

type CacheKeys = 
    'logLevel'
    |'maxProcessing'
    |'pullThreshold'
    |'pullInterval'

export class Cache {

    static logLevel:CacheEntry<LogLevel> = {
        value: LogLevel.DEBUG,
        timestamp: Date.now(),
        expireIn: 30000,
        kvKey: ['logLevel', machineId] as const,
        gate: null
    }

    static maxProcessing:CacheEntry<number> = {
        value: 10,
        timestamp: Date.now(),
        expireIn: 30000,
        kvKey: ['maxProcessing', machineId] as const,
        gate: null
    }

    static pullThreshold:CacheEntry<number> = {
        value: 0.5,
        timestamp: Date.now(),
        expireIn: 30000,
        kvKey: ['pullThreshold', machineId] as const,
        gate: null
    }

    static pullInterval:CacheEntry<number> = {
        value: 5000,
        timestamp: Date.now(),
        expireIn: 30000,
        kvKey: ['pullInterval', machineId] as const,
        gate: null
    }

    /**
     * Cache.get gets something from the memory cache
     * and attempts to ensure the response is up to date with its KV equivalent
     */
    static async get<T extends CacheKeys>(key:T) {

        // get the memory cache entry
        const memCacheEntry = Cache[key] 

        // if memory cache entry is not expired, return it
        if (Date.now() < Cache[key].timestamp + Cache[key].expireIn) return Cache[key].value
        // otherwise, update the memory cache entry with its KV equivalent
        else {

            // if the memory cache entry has a gate set, return the memory entry
            // AKA "if someone's already updating the cache, don't also do that"
            if (Cache[key].gate) return Cache[key].value

            // set the gate so only one thing is in here at a time
            const gate = Promise.withResolvers<void>()
            Cache[key].gate = gate

            // attempt to get the KV equivalent entry
            Logger.detail(`Cache: fetching ${key} data from kv`)
            const get = kv.get<CacheEntry<typeof memCacheEntry.value>>
            const kvCacheEntry = await Logger.wrap(
                rlb.regulate({
                    fn: get.bind(kv),
                    args: [Cache[key].kvKey] as const
                }),
                `Cache: failed to fetch ${key} data from kv`,
                LogLevel.DETAIL, `Cache: successfully fetched ${key} data from kv`)
            
            // on success, update the memory entry with the KV entry with an updated timestamp
            if (kvCacheEntry?.value) {
                Cache[key] = kvCacheEntry.value
                Cache[key].timestamp = Date.now()
            }

            // resolve and nullify the previously set gate
            Cache[key].gate = null
            gate.resolve()

            // return the updated memory entry (or the old one if it failed to update)
            return Cache[key].value

        }
    }

    /**
     * Set the value of a cached entry in memory and in KV
     */
    static async set<
        K extends CacheKeys,
        V extends typeof Cache[K]['value']
    >(key:K, value:V) {

        Cache[key].value = value
        Cache[key].timestamp = Date.now()
        const set = kv.set
        Logger.detail(`Cache: setting key ${key} to value ${value}`)
        await Logger.wrap(
            rlb.regulate({
                fn: set.bind(kv),
                args: [Cache[key].kvKey, Cache[key]] as const
            }),
            `Cache: failed setting key ${key} to value ${value}`,
            LogLevel.DETAIL, `Cache: successfully set key ${key} to value ${value}`)

    }

}