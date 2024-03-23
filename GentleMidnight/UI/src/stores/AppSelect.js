import { writable } from 'svelte/store'
import apps from '@/data/apps.js'

let show = writable(false)
let current = writable(apps[0])

export { show, current }