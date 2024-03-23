type PrmSch = {
    type:'number'|'integer'|'boolean'|'null'
}
type ObjSch = {
    type:'object',
    properties:{ [key:string]: Sch }
}
type ArrSch = {
    type:'array',
    items: Sch[]
}
type StrSch = {
    type:'string',
    rx?:RegExp
}
type AnySch = {
    any: Sch[]
}
type Sch = PrmSch|ObjSch|ArrSch|StrSch|AnySch
// TODO: maybe there can be more data than we specify
// let's just allow that for now until it becomes a problem