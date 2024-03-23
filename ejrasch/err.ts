function isStrSch(x:Sch): x is StrSch { return 'type' in x && x.type == 'string' }
function isArrSch(x:Sch): x is ArrSch { return 'type' in x && x.type == 'array' }
function isAnySch(x:Sch): x is AnySch { return 'any' in x }
function isPrmSch(x:Sch): x is PrmSch { return 'type' in x && ['number', 'integer', 'boolean', 'null'].includes(x.type) }
function isObjSch(x:Sch): x is ObjSch { return 'type' in x && x.type == 'object' }
function isRsu(x:unknown): x is Record<string,unknown> { return typeof x == 'object' && x !== null }

const err = <T>(x:T, sch:Sch):{ message:string, cause:object }|undefined => {
    if (isPrmSch(sch)) {
        switch (sch.type) {
            case 'number':
                if (!(typeof x == 'number'))
                    return {
                        message: 'ValErr: NumSch but x not num',
                        cause: { type: typeof x, x } }; break
            case 'boolean':
                if (!(typeof x == 'boolean'))
                    return {
                        message: 'ValErr: BlnSch but x not bln',
                        cause: { type: typeof x, x } }; break
            case 'null':
                if (x !== null)
                    return {
                        message: 'ValErr: NulSch but x not nul',
                        cause: { type: typeof x, x } }; break
            case 'integer':
                if (!(typeof x == 'number' && parseInt(String(x)) == x))
                    return {
                        message: 'ValErr: IntSch but x not int',
                        cause: { x } }; break } }
    else if (isStrSch(sch)) {
        if (!(typeof x == 'string'))
            return {
                message: 'ValErr: StrSch but x not str',
                cause: { type: typeof x, x } }
        const { rx } = sch
        if (rx && !x.match(rx)) {
            const { source, flags } = rx
            return {
                message: 'ValErr: StrSch regex unmatched',
                cause: { rx: { source, flags }, x } } } }
    else if (isArrSch(sch)) {
        if (!(x instanceof Array))
            return {
                message: 'ValErr: ArrSch but x not arr',
                cause: { type: typeof x, x } }
        const { items } = sch
        // for each element of x as y, we have an array (errs) of { m, c }|undefined with elements err
        // being why y didn't (or undefined if it did) match each schema in sch.items
        // if, for each y, there is any err that is undefined, good
        // if, for any y, there is no undefined err, ValErr
        const errsets = x.map((y:unknown) => items.map(item => err(y, item)))
        for (const [i, errs] of errsets.entries())
            // we want to know which y failed by index against x, y itself, all errs, items
            if (!errs.includes(undefined))
                return {
                    message: 'ValErr: ArrSch y with no undefined err',
                    cause: { yIndex: i, y: x[i], errs, items } } }
    else if (isObjSch(sch)) {
        if (!isRsu(x))
            return {
                message: 'ValErr: ObjSch but x not obj (Rsu)',
                cause: { type: typeof x, x } }
        // so what i really want here is the ability to say where, if, in the object something went wrong
        for (const [prop, psch] of Object.entries(sch.properties)) {
            const e = err(x[prop], psch)
            if (e) {
                const { message, cause } = e
                return {
                    message: 'ValErr: ObjSch mismatch',
                    cause: { prop, err: { message, cause }, x } } } } }
    else if (isAnySch(sch)) {
        // map schs to errs, if any undefined, all is good
        // if none undefined, ValErr
        const errs = sch.any.map(sch => {
            const e = err(x, sch)
            if (e) {
                const { message, cause } = e
                return { message, cause }
            }
        })
        if (!errs.includes(undefined))
            return {
                message: 'ValErr: AnySch no undefined err',
                cause: { x, errs, schs: sch.any } } }
    else
        return {
            message: 'ValErr: unknown Sch',
            cause: { sch } } }
export default err