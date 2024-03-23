function isString(x:unknown):x is string { return typeof x == 'string' }
function isBigintable(x:unknown):x is bigintable {
    if (typeof x == 'string' || typeof x == 'number') try {
        return BigInt(x) !== undefined } catch (_) { return false } else return false }
function isArray(x:unknown): x is Array<unknown> { return x instanceof Array }
function isObject(x:unknown): x is object { return typeof x == 'object' && x !== null }
function isJsonRpcRes(x:unknown): x is JsonRpcRes {
    return isObject(x)
        && 'jsonrpc' in x && x.jsonrpc == '2.0'
        && ('result' in x || 'error' in x)
        && 'id' in x && typeof x.id == 'number'
}

export { isString, isBigintable, isArray, isObject, isJsonRpcRes }