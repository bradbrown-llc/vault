function promiseWithResolvers<T extends U,U>() {
    return Promise.withResolvers() as {
        promise:Promise<T>,
        resolve:(value: U | PromiseLike<U>)=>void,
        reject:(reason:Error)=>void
    }
} 

const foo:((value:string|PromiseLike<string>)=>void)[] = []

function bar<N extends string>(x:N) {
    const { promise, resolve, reject } = promiseWithResolvers<N,string>()
    const bar = [resolve]
    foo.push(resolve)
    return promise
}

const baz = await bar('goo')