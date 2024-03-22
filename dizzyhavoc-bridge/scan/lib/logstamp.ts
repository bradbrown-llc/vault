import { loglev } from './mod.ts'

export function logstamp() {
    const date = new Date()
    const month = String(date.getMonth()).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    const mills = String(date.getMilliseconds()).padStart(3, '0')
    return `[${month}-${day}|${hour}:${minute}:${second}.${mills}]`
}