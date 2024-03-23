import err from './err.ts'
export default <T>(x:unknown, sch:Sch): x is T => { return !err(x, sch) }