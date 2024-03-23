export function handleCatch(reason) {
    if (reason instanceof Error) throw reason
    else throw new Error(reason)
}