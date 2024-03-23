import {
    Cache, Logger, LogLevel
} from '../internal.ts'


console.log(
    `${'\u001b[38;5;51m'
    }${'log errors with reasons and/or messages'
    }${'\u001b[0m'}`
)

await Cache.set('logLevel', LogLevel.INFO)

await Logger.error({ reason: new Error('foo error') })
await Logger.error({ message: 'bar message', reason: new Error('baz error') })
await Logger.error({ message: 'boo message' })

console.log(
    `${'\u001b[38;5;51m'
    }${'wrap promises with custom reject and resolve messages '
    }${'and specify the LogLevel required to log the resolution message'
    }${'\u001b[0m'}`
)

await Logger.wrap(
    Promise.reject(new Error('promise failed for technical reason')),
    'we failed to do a thing',
    LogLevel.INFO, 'we successfully did a thing')
await Logger.wrap(
    Promise.resolve(3),
    'we failed to do a thing',
    LogLevel.INFO, 'we successfully did a thing')
await Logger.wrap(
    fetch('http://10.255.255.1', { signal: AbortSignal.timeout(1000) }),
    'D:',
    LogLevel.INFO, ':D')

console.log(
    `${'\u001b[38;5;51m'
    }${'change the log level in real time by altering the cache or deno KV setting'
    }${'\u001b[0m'}`
)

await Cache.set('logLevel', LogLevel.INFO)

await Logger.wrap(
    fetch('http://google.com', { signal: AbortSignal.timeout(10000) }),
    'D:',
    LogLevel.INFO, ':D')